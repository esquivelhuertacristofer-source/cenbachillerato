/**
 * Datos del laboratorio «Taller de descripción y narración» — LC-II-P02.
 *
 * Progresión: «Escribe un texto descriptivo o narrativo de su autoría.»
 * (Lengua y Comunicación II, 2.º semestre.)
 *
 * POR QUÉ ESTE LABORATORIO NO PIDE «ESCRIBE UN CUENTO Y TE CALIFICO».
 * Un texto libre no se puede calificar con honestidad desde el navegador: no
 * hay forma de medir si una imagen funciona o si un final cierra. Lo que sí se
 * puede poner a prueba son las DECISIONES de oficio que hay detrás de cada
 * línea —qué palabra elijo, en qué orden revelo lo que veo, qué convierte una
 * foto en un suceso, qué verbo hunde una escena—, y eso es lo que aquí se
 * manipula. La escritura propia existe, pero al final, declarada opcional y sin
 * calificación.
 *
 * QUÉ ES VERBATIM Y QUÉ NO — el laboratorio lo declara al pie y el alumno
 * tiene derecho a saberlo:
 *   · VERBATIM de la base de datos: la lectura A1 (marco teórico de la ficha,
 *     sus preguntas de comprensión y el callout sobre Rulfo), el quiz A2
 *     (`RETO_QUIZ`), la consigna y los criterios de la reflexión escrita A3
 *     (`TALLER`), los cuatro enunciados verdadero/falso de A4 (`HECHOS`), el
 *     glosario A5 (`GLOSARIO`) y el texto con huecos A6 (en el archivo
 *     `descripcion-narracion-huecos.ts`). Los cinco conectores temporales de
 *     `CONECTORES` son los que enumera la propia lectura A1.
 *   · ILUSTRATIVO, escrito para este laboratorio: todas las oraciones y escenas
 *     de `FICHAS`, `ESCENAS`, `CASOS` y `ITEMS_VERBO`. Son situaciones
 *     verosímiles de un entorno mexicano cotidiano; ninguna persona, comercio
 *     ni institución es real, y no se cita a ningún autor.
 *
 * Deliberadamente NO se reproduce ningún fragmento de «No oyes ladrar los
 * perros»: la lectura A1 lo comenta y el laboratorio lo respeta, pero citar de
 * memoria a un autor real es la forma más fácil de ponerle en la boca algo que
 * no escribió.
 *
 * Sin three ni React: datos puros.
 */

import type { QuizEvaluable } from "./_reto-quiz";

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 1 — «Del adjetivo al detalle»
 *
 * El criterio A3 dice «Incluye detalles específicos (no genéricos)». Dicho así
 * no enseña nada: hay que VERLO. Cada ficha ofrece el mismo hueco con tres
 * rellenos —un adjetivo genérico, un juicio abstracto y un detalle concreto— y
 * el laboratorio muestra qué imagen produce cada uno en la cabeza del lector.
 * La nitidez no es una nota: es la consecuencia visible de la elección.
 * ═══════════════════════════════════════════════════════════════════════════ */

export type TipoRelleno = "detalle" | "generico" | "juicio";

export const RELLENO_INFO: Record<TipoRelleno, { label: string; color: string; icono: string }> = {
  detalle: { label: "Detalle concreto", color: "#34D399", icono: "fa-eye" },
  generico: { label: "Adjetivo genérico", color: "#8AA0B8", icono: "fa-cloud" },
  juicio: { label: "Juicio abstracto", color: "#C084FC", icono: "fa-scale-unbalanced" },
};

export interface OpcionDetalle {
  id: string;
  texto: string;
  tipo: TipoRelleno;
  /** Qué tan nítida queda la imagen, 0–100. Es una consecuencia visible, no una calificación. */
  nitidez: number;
  /** Lo que el lector ve de verdad con ese relleno. */
  imagen: string;
  /** Por qué pasa eso. */
  porque: string;
}

export interface FichaDetalle {
  id: string;
  titulo: string;
  /** El texto antes y después del hueco. */
  antes: string;
  despues: string;
  opciones: OpcionDetalle[];
}

export const FICHAS: FichaDetalle[] = [
  {
    id: "casa",
    titulo: "La casa de la abuela",
    antes: "La casa de mi abuela era ",
    despues: ".",
    opciones: [
      {
        id: "casa-g",
        texto: "muy bonita",
        tipo: "generico",
        nitidez: 18,
        imagen: "Una casa. Cualquiera. El lector pone la suya y ya no está leyendo la tuya.",
        porque:
          "«Bonita» no describe la casa: describe lo que tú sentiste al verla. Y «muy» no agrega información, solo sube el volumen.",
      },
      {
        id: "casa-j",
        texto: "inolvidable",
        tipo: "juicio",
        nitidez: 30,
        imagen: "Una conclusión tuya. El lector no puede olvidar algo que nunca vio.",
        porque:
          "Le estás dando al lector el efecto sin darle la causa. Lo inolvidable se demuestra con lo que se recuerda, no se anuncia.",
      },
      {
        id: "casa-d",
        texto: "de adobe encalado, con un limonero que tapaba la ventana de la cocina",
        tipo: "detalle",
        nitidez: 96,
        imagen: "Un muro blanco, grueso; una ventana en sombra; olor a limón cuando alguien la abre.",
        porque:
          "Dos datos verificables —el material y el árbol— y el lector ya construye la casa entera, incluidos la temperatura y el olor que tú no escribiste.",
      },
    ],
  },
  {
    id: "mercado",
    titulo: "El pasillo del mercado",
    antes: "El pasillo del mercado olía a ",
    despues: ".",
    opciones: [
      {
        id: "mercado-g",
        texto: "rico",
        tipo: "generico",
        nitidez: 14,
        imagen: "Nada. «Rico» es una reacción, no un olor.",
        porque:
          "El olfato es el sentido más concreto que existe y aquí lo estás desperdiciando: no nombraste ni una sola cosa que huela.",
      },
      {
        id: "mercado-d",
        texto: "cilantro recién cortado y carbón mojado",
        tipo: "detalle",
        nitidez: 94,
        imagen: "Un puesto de verduras junto a uno de barbacoa, y la humedad del piso recién lavado.",
        porque:
          "Dos olores que no se parecen entre sí, y de su choque sale el pasillo completo. El detalle no tiene que ser bello: tiene que ser exacto.",
      },
      {
        id: "mercado-j",
        texto: "tradición",
        tipo: "juicio",
        nitidez: 26,
        imagen: "Una idea abstracta flotando donde debería haber un puesto.",
        porque:
          "La tradición no huele: huelen las cosas que la tradición pone en la mesa. Nombra las cosas y la idea llega sola.",
      },
    ],
  },
  {
    id: "manos",
    titulo: "Las manos de don Ernesto",
    antes: "Don Ernesto tenía las manos ",
    despues: ".",
    opciones: [
      {
        id: "manos-d",
        texto: "partidas en las yemas, con cal metida bajo las uñas",
        tipo: "detalle",
        nitidez: 97,
        imagen: "Grietas secas, polvo blanco en los bordes; el lector concluye solo que ese hombre trabaja con obra.",
        porque:
          "El detalle concreto hace el trabajo del juicio y encima lo hace mejor: nadie discute lo que vio con sus propios ojos.",
      },
      {
        id: "manos-g",
        texto: "feas",
        tipo: "generico",
        nitidez: 16,
        imagen: "Un adjetivo que habla de ti, no de él.",
        porque:
          "«Feo» no es información sobre el objeto, es tu opinión sobre el objeto. El lector no sabe qué forma tienen esas manos.",
      },
      {
        id: "manos-j",
        texto: "trabajadoras",
        tipo: "juicio",
        nitidez: 34,
        imagen: "Una etiqueta moral pegada a unas manos que siguen invisibles.",
        porque:
          "Es la conclusión a la que debería llegar el lector, no el dato de partida. Si la escribes tú, le quitas el trabajo de descubrirla.",
      },
    ],
  },
  {
    id: "camion",
    titulo: "El camión de las seis",
    antes: "El camión de las seis iba ",
    despues: ".",
    opciones: [
      {
        id: "camion-j",
        texto: "como siempre",
        tipo: "juicio",
        nitidez: 20,
        imagen: "Una costumbre. El lector no comparte tu «siempre» porque nunca subió a ese camión.",
        porque:
          "Lo cotidiano para ti es desconocido para quien lee. Describir es no dar por supuesto lo que solo tú has visto.",
      },
      {
        id: "camion-g",
        texto: "muy lleno",
        tipo: "generico",
        nitidez: 22,
        imagen: "Gente. Sin número, sin cuerpos, sin incomodidad.",
        porque:
          "«Lleno» admite cien versiones distintas. Un número y una consecuencia física lo vuelven una sola.",
      },
      {
        id: "camion-d",
        texto: "con catorce personas de pie y la puerta trasera amarrada con un mecate",
        tipo: "detalle",
        nitidez: 95,
        imagen: "Cuerpos apretados hasta la escalera y una puerta que no cierra: el viaje se vuelve incómodo y peligroso.",
        porque:
          "El número da la medida y el mecate da el riesgo. Ningún adjetivo consigue las dos cosas a la vez.",
      },
    ],
  },
  {
    id: "lluvia",
    titulo: "La lluvia sobre la lámina",
    antes: "La lluvia sonaba ",
    despues: ".",
    opciones: [
      {
        id: "lluvia-g",
        texto: "fuerte",
        tipo: "generico",
        nitidez: 24,
        imagen: "Ruido de volumen alto, sin textura ni material.",
        porque:
          "«Fuerte» mide la intensidad, pero un sonido también tiene forma: de qué está hecho y contra qué golpea.",
      },
      {
        id: "lluvia-d",
        texto: "como puños de arroz cayendo sobre la lámina",
        tipo: "detalle",
        nitidez: 93,
        imagen: "Granizo menudo, techo de metal, una casa que no aísla del clima.",
        porque:
          "La comparación es concreta de los dos lados: arroz y lámina son cosas que cualquiera ha tocado. Comparar con algo vago no aclara nada.",
      },
      {
        id: "lluvia-j",
        texto: "melancólica",
        tipo: "juicio",
        nitidez: 32,
        imagen: "Un estado de ánimo puesto sobre el agua. El lector aún no oye nada.",
        porque:
          "La melancolía es el efecto que quieres provocar. Si la nombras, la gastas; si la construyes con un sonido preciso, llega.",
      },
    ],
  },
  {
    id: "sobre",
    titulo: "El sobre de la convocatoria",
    antes: "Mi hermana se quedó ",
    despues: " cuando abrió el sobre.",
    opciones: [
      {
        id: "sobre-j",
        texto: "distinta para siempre",
        tipo: "juicio",
        nitidez: 28,
        imagen: "Un anuncio solemne sobre algo que todavía no ocurre en la página.",
        porque:
          "Es una sentencia sobre el futuro; el lector está en el presente de la escena y aún no tiene motivos para creerte.",
      },
      {
        id: "sobre-d",
        texto: "con el sobre a medio abrir y los ojos yendo del papel a mi cara",
        tipo: "detalle",
        nitidez: 96,
        imagen: "Unas manos detenidas a la mitad y una mirada que busca confirmación: sorpresa sin decir «sorpresa».",
        porque:
          "Dos gestos pequeños bastan. El cuerpo es el lugar donde las emociones se vuelven visibles y, por lo tanto, escribibles.",
      },
      {
        id: "sobre-g",
        texto: "muy sorprendida",
        tipo: "generico",
        nitidez: 19,
        imagen: "Una emoción anunciada. Ninguna cara, ningún cuerpo.",
        porque:
          "Nombrar la emoción es el atajo más viejo de la descripción. El lector la cree cuando la ve en el cuerpo, no cuando se la informan.",
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 2 — «El orden de la mirada»
 *
 * Describir no es volcar todo lo que hay: es decidir en qué orden se revela.
 * El alumno ELIGE primero la ruta —ninguna de las dos es incorrecta— y después
 * ordena los mismos fragmentos según la ruta que eligió. Lo evaluable es la
 * coherencia con su propia decisión, no la decisión misma; y lo que cambia es
 * qué imagen se lleva el lector, porque lo último que se lee es lo que queda.
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Ruta = "general" | "detalle";

export const RUTA_INFO: Record<Ruta, { label: string; descripcion: string; icono: string; color: string }> = {
  general: {
    label: "De lo general al detalle",
    descripcion: "Empiezas por el panorama y vas cerrando hasta un solo objeto pequeño.",
    icono: "fa-magnifying-glass-plus",
    color: "#4FC3F7",
  },
  detalle: {
    label: "Del detalle a lo general",
    descripcion: "Empiezas por un objeto pequeño y vas abriendo hasta el panorama completo.",
    icono: "fa-magnifying-glass-minus",
    color: "#FFB74D",
  },
};

export interface Fragmento {
  id: string;
  texto: string;
  /** 1 = lo más general de la escena; el mayor = lo más particular. */
  rango: number;
}

export interface Escena {
  id: string;
  titulo: string;
  contexto: string;
  fragmentos: Fragmento[];
  /** Qué se lleva el lector si la escena termina en el detalle. */
  cierreGeneral: string;
  /** Qué se lleva el lector si la escena termina en el panorama. */
  cierreDetalle: string;
}

export const ESCENAS: Escena[] = [
  {
    id: "patio",
    titulo: "El patio de la escuela a las siete",
    contexto: "Vas a describir el patio antes de que lleguen los grupos. Los cinco fragmentos son tuyos; el orden, también.",
    fragmentos: [
      { id: "patio-1", rango: 1, texto: "El patio entero cabe en una cancha de basquetbol con las líneas borradas." },
      { id: "patio-2", rango: 2, texto: "Del lado que da al norte, tres jacarandas tiran flores sobre el cemento." },
      { id: "patio-3", rango: 3, texto: "Bajo la jacaranda de en medio hay una banca de concreto con la pintura levantada." },
      { id: "patio-4", rango: 4, texto: "Sobre la banca alguien dejó una mochila abierta." },
      { id: "patio-5", rango: 5, texto: "De la mochila asoma un cuaderno con la esquina mordida por la humedad." },
    ],
    cierreGeneral:
      "Terminaste en el cuaderno mojado. Eso es lo que se lleva el lector: un objeto olvidado, y con él la sospecha de que alguien no volvió por su mochila.",
    cierreDetalle:
      "Terminaste en el patio vacío. Eso es lo que se lleva el lector: el tamaño del silencio, con el cuaderno ya guardado como un detalle del camino.",
  },
  {
    id: "fonda",
    titulo: "La fonda de la esquina",
    contexto: "La misma cocina puede abrirse o cerrarse. Elige por dónde entra la mirada.",
    fragmentos: [
      { id: "fonda-1", rango: 1, texto: "La fonda ocupa lo que antes fue la cochera de una casa: seis mesas y un ventilador de pie." },
      { id: "fonda-2", rango: 2, texto: "Al fondo, detrás de una cortina de plástico, está la cocina." },
      { id: "fonda-3", rango: 3, texto: "En la cocina, una estufa de cuatro quemadores sostiene tres ollas tapadas." },
      { id: "fonda-4", rango: 4, texto: "La olla de en medio suelta vapor por una grieta de la tapa." },
      { id: "fonda-5", rango: 5, texto: "Sobre la grieta una gota se forma, se estira y cae." },
    ],
    cierreGeneral:
      "Terminaste en la gota. El lector se queda con el tiempo detenido de una cocina que lleva horas trabajando.",
    cierreDetalle:
      "Terminaste en la cochera convertida en fonda. El lector se queda con el negocio entero y con la historia de la casa que dejó de serlo.",
  },
  {
    id: "parada",
    titulo: "La parada del camión bajo la lluvia",
    contexto: "Hay cuatro personas y una bolsa rota. Tú decides si el lector las ve antes o después de la avenida.",
    fragmentos: [
      { id: "parada-1", rango: 1, texto: "La avenida se vació de golpe: solo quedan los faros pasando." },
      { id: "parada-2", rango: 2, texto: "En la acera de enfrente, un techo de lámina cubre tres metros de banqueta." },
      { id: "parada-3", rango: 3, texto: "Bajo la lámina esperan cuatro personas apretadas contra la pared." },
      { id: "parada-4", rango: 4, texto: "La que está en la orilla sostiene una bolsa del mandado sobre la cabeza." },
      { id: "parada-5", rango: 5, texto: "Por una esquina rota de la bolsa le escurre agua hasta el zapato." },
    ],
    cierreGeneral:
      "Terminaste en el zapato mojado. El lector se lleva la incomodidad concreta de una persona, no la lluvia en abstracto.",
    cierreDetalle:
      "Terminaste en la avenida vacía. El lector se lleva la soledad del lugar, y las cuatro personas quedan como una isla dentro de ella.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 3 — «De la foto al suceso»
 *
 * El quiz A2 pregunta qué diferencia a un texto narrativo de uno descriptivo:
 * «el narrativo cuenta eventos en el tiempo; el descriptivo presenta
 * características sin acción». Aquí eso se hace con las manos: se parte de una
 * descripción quieta y hay que decidir (1) qué la pone en movimiento —no todo
 * lo que se puede añadir es un suceso— y (2) con qué conector temporal se
 * coloca ese cambio en el tiempo. Los cinco conectores son los que enumera la
 * lectura A1.
 * ═══════════════════════════════════════════════════════════════════════════ */

export type TipoCandidato = "cambio" | "descripcion" | "juicio";

export interface CandidatoSuceso {
  id: string;
  texto: string;
  tipo: TipoCandidato;
  porque: string;
}

export interface ConectorTemporal {
  id: string;
  /** Verbatim de la lectura A1. */
  texto: string;
  uso: string;
}

/** Los cinco conectores que enumera LC-II-P02-A1, verbatim. */
export const CONECTORES: ConectorTemporal[] = [
  { id: "despues", texto: "después", uso: "Lo que sigue, sin decir cuánto tardó." },
  { id: "mientras", texto: "mientras tanto", uso: "Dos cosas que ocurren a la vez en lugares distintos." },
  { id: "alcabo", texto: "al cabo de", uso: "Después de una espera que sí se mide." },
  { id: "enese", texto: "en ese momento", uso: "Exactamente en el mismo instante." },
  { id: "aldia", texto: "al día siguiente", uso: "Un salto limpio de un día al otro." },
];

export interface CasoSuceso {
  id: string;
  titulo: string;
  estatica: string;
  candidatos: CandidatoSuceso[];
  /** La relación temporal que el caso pide, en palabras del propio caso. */
  relacion: string;
  /** id del conector correcto. */
  conector: string;
  /** Cómo queda la narración completa al elegir bien las dos cosas. */
  resultado: string;
  porqueConector: string;
}

export const CASOS: CasoSuceso[] = [
  {
    id: "tienda",
    titulo: "La tienda de la esquina",
    estatica: "La tienda de la esquina tiene la cortina de metal verde y un letrero pintado a mano.",
    candidatos: [
      {
        id: "tienda-a",
        tipo: "descripcion",
        texto: "el letrero dice «Abarrotes» en letras rojas ya despintadas",
        porque:
          "Es más descripción: agrega una característica, pero la escena sigue congelada. Nada pasa de un momento al siguiente.",
      },
      {
        id: "tienda-b",
        tipo: "cambio",
        texto: "la cortina amaneció a medio abrir y nadie contestó desde adentro",
        porque:
          "Aquí sí hay suceso: algo está distinto de como estaba y esa diferencia abre una pregunta. Eso es el nudo del que habla la lectura A1.",
      },
      {
        id: "tienda-c",
        tipo: "juicio",
        texto: "es la tienda más querida de toda la cuadra",
        porque:
          "Es una valoración tuya. No describe ni narra: solo dice qué opinas, y el lector no tiene con qué comprobarlo.",
      },
    ],
    relacion: "El cambio ocurre al otro día de lo que venías contando.",
    conector: "aldia",
    resultado: "Al día siguiente, la cortina amaneció a medio abrir y nadie contestó desde adentro.",
    porqueConector:
      "«Al día siguiente» da el salto de un día al otro sin tener que contar la noche. Los conectores temporales son las bisagras del texto narrativo.",
  },
  {
    id: "salon",
    titulo: "El salón de segundo",
    estatica: "El salón tiene treinta y dos butacas y un pizarrón blanco con marcas que ya no salen.",
    candidatos: [
      {
        id: "salon-a",
        tipo: "cambio",
        texto: "un trueno apagó las luces y el salón entero se quedó a oscuras",
        porque:
          "Un suceso, y de los buenos: cambia el estado de todo lo descrito antes. Después del trueno, ese salón ya no es el mismo salón.",
      },
      {
        id: "salon-b",
        tipo: "descripcion",
        texto: "las butacas son de plástico azul con las paletas rayadas",
        porque:
          "Otra característica más. Puede ser un detalle concreto excelente y aun así no narrar nada: describir y narrar son actos distintos.",
      },
      {
        id: "salon-c",
        tipo: "juicio",
        texto: "es un salón incómodo y feo",
        porque:
          "Dos adjetivos genéricos que además opinan. Ni pone la escena en movimiento ni la hace más visible.",
      },
    ],
    relacion: "El cambio ocurre en el mismo instante en que alguien estaba hablando.",
    conector: "enese",
    resultado: "En ese momento, un trueno apagó las luces y el salón entero se quedó a oscuras.",
    porqueConector:
      "«En ese momento» clava el suceso en el instante exacto de lo anterior: sin él, el lector no sabría si el trueno cayó durante la clase o una hora más tarde.",
  },
  {
    id: "cancha",
    titulo: "La cancha de la unidad",
    estatica: "La cancha de la unidad tiene una canasta sin red y el piso agrietado en una esquina.",
    candidatos: [
      {
        id: "cancha-a",
        tipo: "juicio",
        texto: "esa cancha merece una remodelación urgente",
        porque:
          "Es una opinión sobre la cancha, no un hecho que ocurra en ella. Sirve para un texto de opinión, no para narrar.",
      },
      {
        id: "cancha-b",
        tipo: "descripcion",
        texto: "el tablero está pintado de blanco con el borde naranja",
        porque:
          "Descripción pura. La escena se vuelve más nítida, pero el reloj de la historia sigue detenido.",
      },
      {
        id: "cancha-c",
        tipo: "cambio",
        texto: "el balón se metió por la grieta y rodó hasta la calle",
        porque:
          "Suceso: el objeto que estaba dentro ahora está fuera, y ese desplazamiento obliga a alguien a hacer algo. La grieta descrita antes se volvió causa.",
      },
    ],
    relacion: "El cambio ocurre justo a continuación de lo anterior, sin decir cuánto tardó.",
    conector: "despues",
    resultado: "Después, el balón se metió por la grieta y rodó hasta la calle.",
    porqueConector:
      "«Después» es el conector más neutro de la lista: encadena sin comprometerse con una duración. Úsalo cuando el tiempo exacto no importa.",
  },
  {
    id: "clinica",
    titulo: "La sala de espera",
    estatica: "La sala de espera de la clínica tiene ocho sillas unidas y un reloj de pared sin segundero.",
    candidatos: [
      {
        id: "clinica-a",
        tipo: "descripcion",
        texto: "las sillas son de metal con el asiento de plástico beige",
        porque:
          "Característica, no acontecimiento. Fíjate en el verbo: «son» describe un estado; para narrar necesitas un verbo que cambie algo.",
      },
      {
        id: "clinica-b",
        tipo: "cambio",
        texto: "la puerta del consultorio se abrió y una enfermera leyó un apellido en voz alta",
        porque:
          "Dos acciones encadenadas que rompen la espera. El reloj sin segundero que describiste antes ahora significa algo: el tiempo que no se podía medir por fin se acabó.",
      },
      {
        id: "clinica-c",
        tipo: "juicio",
        texto: "esperar ahí es lo más aburrido del mundo",
        porque:
          "Le entregas al lector la conclusión en vez de hacerle sentir la espera. Un reloj sin segundero aburre mejor que la palabra «aburrido».",
      },
    ],
    relacion: "El cambio ocurre tras una espera larga que sí quieres medir.",
    conector: "alcabo",
    resultado: "Al cabo de dos horas, la puerta del consultorio se abrió y una enfermera leyó un apellido en voz alta.",
    porqueConector:
      "«Al cabo de» pide una medida y por eso convierte la espera en experiencia: «dos horas» pesa, «después» no pesa nada.",
  },
  {
    id: "azotea",
    titulo: "La azotea",
    estatica: "En la azotea hay tendederos de alambre, dos tinacos y una silla sin respaldo.",
    candidatos: [
      {
        id: "azotea-a",
        tipo: "cambio",
        texto: "el viento arrancó una sábana del tendedero y la echó a la calle",
        porque:
          "Suceso con consecuencia fuera de cuadro: la sábana ya no está donde estaba y alguien, abajo, va a tener que verla caer.",
      },
      {
        id: "azotea-b",
        tipo: "juicio",
        texto: "la azotea es el mejor lugar de la casa",
        porque:
          "Tu preferencia no es un hecho de la historia. Si la azotea es el mejor lugar, demuéstralo con lo que ahí pasa.",
      },
      {
        id: "azotea-c",
        tipo: "descripcion",
        texto: "los tinacos son negros y uno tiene la tapa amarrada con alambre",
        porque:
          "Buen detalle concreto —el alambre se ve— pero sigue siendo descripción: enriquece la foto sin darle play.",
      },
    ],
    relacion: "El cambio ocurre al mismo tiempo que otra cosa que ya estaba pasando abajo, en la casa.",
    conector: "mientras",
    resultado: "Mientras tanto, el viento arrancó una sábana del tendedero y la echó a la calle.",
    porqueConector:
      "«Mientras tanto» sostiene dos líneas a la vez: mientras abajo ocurre una cosa, arriba ocurre otra. Es el conector de la simultaneidad.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 4 — «El verbo que hunde»
 *
 * En un texto narrativo el verbo carga con la acción, así que un verbo comodín
 * —hacer, haber, estar, poner, tener— apaga la escena aunque todo lo demás
 * esté bien escrito. El alumno señala en la frase el verbo que la hunde y
 * elige con qué sustituirlo; los reemplazos incorrectos no son trampas: son
 * los sinónimos neutros y los cultismos a los que suele recurrirse, y cada uno
 * explica por qué tampoco funciona.
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface PiezaFrase {
  texto: string;
  /** Si está presente, la pieza es un verbo que se puede señalar. */
  verboId?: string;
}

export interface Reemplazo {
  id: string;
  texto: string;
  ok: boolean;
  porque: string;
}

export interface ItemVerbo {
  id: string;
  titulo: string;
  /** La frase partida en piezas; las que llevan `verboId` son verbos señalables. */
  piezas: PiezaFrase[];
  /** id del verbo comodín que hunde la frase. */
  hunde: string;
  /** Por qué ese verbo la hunde. */
  porqueHunde: string;
  /** Por qué los otros verbos señalables NO son el problema, por id. */
  porqueNo: { verboId: string; texto: string }[];
  reemplazos: Reemplazo[];
  /** La frase ya corregida. */
  resultado: string;
}

export const ITEMS_VERBO: ItemVerbo[] = [
  {
    id: "camion",
    titulo: "El frenón",
    piezas: [
      { texto: "Cuando el camión " },
      { texto: "frenó", verboId: "freno" },
      { texto: ", la señora de adelante " },
      { texto: "hizo", verboId: "hizo" },
      { texto: " un movimiento con la mano y el bolso " },
      { texto: "cayó", verboId: "cayo" },
      { texto: " al pasillo." },
    ],
    hunde: "hizo",
    porqueHunde:
      "«Hacer» sirve para todo y por eso no muestra nada. «Hizo un movimiento con la mano» ocupa cinco palabras para no decir qué movimiento fue.",
    porqueNo: [
      { verboId: "freno", texto: "«Frenó» es exacto: un camión frena y se ve. No lo toques." },
      { verboId: "cayo", texto: "«Cayó» nombra una acción concreta con dirección. Está bien puesto." },
    ],
    reemplazos: [
      { id: "camion-1", texto: "manoteó", ok: true, porque: "Un solo verbo y ya se ve el brazo yendo hacia algo. Ahorra cuatro palabras y gana una imagen." },
      { id: "camion-2", texto: "realizó", ok: false, porque: "Es «hacer» con corbata: igual de vago, pero más largo y más frío." },
      { id: "camion-3", texto: "ejecutó", ok: false, porque: "Registro de manual técnico. Nadie «ejecuta» un manotazo dentro de un camión." },
    ],
    resultado: "Cuando el camión frenó, la señora de adelante manoteó y el bolso cayó al pasillo.",
  },
  {
    id: "fila",
    titulo: "La fila del trámite",
    piezas: [
      { texto: "" },
      { texto: "Había", verboId: "habia" },
      { texto: " mucha gente en la fila y el sol " },
      { texto: "pegaba", verboId: "pegaba" },
      { texto: " en la nuca desde las nueve." },
    ],
    hunde: "habia",
    porqueHunde:
      "«Haber» solo informa de que algo existe. La fila no existe: aprieta, huele, se mueve. Un verbo que muestre eso narra; «había» solo cuenta cabezas.",
    porqueNo: [
      { verboId: "pegaba", texto: "«Pegaba» es una metáfora viva y física del sol. Ese verbo ya está trabajando." },
    ],
    reemplazos: [
      { id: "fila-1", texto: "Se amontonaba", ok: true, porque: "Muestra los cuerpos juntos y sin orden: la fila deja de ser un dato y se vuelve una experiencia." },
      { id: "fila-2", texto: "Existía", ok: false, porque: "Es «haber» disfrazado de filosofía. No añade ni forma ni movimiento." },
      { id: "fila-3", texto: "Se encontraba", ok: false, porque: "Cuatro sílabas para decir «estaba». Sigue sin mostrar qué hace esa gente." },
    ],
    resultado: "Se amontonaba mucha gente en la fila y el sol pegaba en la nuca desde las nueve.",
  },
  {
    id: "tio",
    titulo: "El tío en la puerta",
    piezas: [
      { texto: "Mi tío " },
      { texto: "estaba", verboId: "estaba" },
      { texto: " en la puerta con el sombrero en la mano y no " },
      { texto: "decía", verboId: "decia" },
      { texto: " nada." },
    ],
    hunde: "estaba",
    porqueHunde:
      "«Estar» no siempre sobra, pero aquí toda la escena depende de esa postura: el tío no está en la puerta, se detuvo en ella. El verbo debe cargar la tensión.",
    porqueNo: [
      { verboId: "decia", texto: "«No decía nada» es exacto y el silencio es la información. Cambiarlo sería adornar." },
    ],
    reemplazos: [
      { id: "tio-2", texto: "permanecía", ok: false, porque: "Culto y estático: sigue sin decir por qué ese hombre no entra." },
      { id: "tio-1", texto: "se plantó", ok: true, porque: "Añade voluntad y peso: alguien que se planta decidió quedarse ahí, y eso ya es un conflicto." },
      { id: "tio-3", texto: "se hallaba", ok: false, porque: "Rebuscado y vago a la vez, que es la peor combinación posible." },
    ],
    resultado: "Mi tío se plantó en la puerta con el sombrero en la mano y no decía nada.",
  },
  {
    id: "gotera",
    titulo: "La gotera del pasillo",
    piezas: [
      { texto: "El agua " },
      { texto: "caía", verboId: "caia" },
      { texto: " desde el tercer piso y el conserje " },
      { texto: "puso", verboId: "puso" },
      { texto: " una cubeta bajo la gotera." },
    ],
    hunde: "puso",
    porqueHunde:
      "«Poner» es el comodín de las manos: no dice si fue con cuidado, de prisa o a regañadientes. En narración, cómo se hace algo es casi toda la información.",
    porqueNo: [
      { verboId: "caia", texto: "«Caía» describe exactamente lo que hace el agua. Es simple y es correcto." },
    ],
    reemplazos: [
      { id: "gotera-2", texto: "colocó", ok: false, porque: "Sinónimo neutro de «poner». Cambia la palabra y no cambia la imagen." },
      { id: "gotera-3", texto: "depositó", ok: false, porque: "Lenguaje de oficina. Un conserje con una cubeta y una gotera no deposita nada." },
      { id: "gotera-1", texto: "encajó", ok: true, porque: "Sugiere que la cubeta tuvo que entrar a presión en un hueco: aparece el espacio, aparece el oficio." },
    ],
    resultado: "El agua caía desde el tercer piso y el conserje encajó una cubeta bajo la gotera.",
  },
  {
    id: "balon",
    titulo: "El final del partido",
    piezas: [
      { texto: "El niño " },
      { texto: "tenía", verboId: "tenia" },
      { texto: " el balón contra el pecho y no lo " },
      { texto: "soltaba", verboId: "soltaba" },
      { texto: " aunque ya hubiera terminado el partido." },
    ],
    hunde: "tenia",
    porqueHunde:
      "«Tener» indica posesión, y aquí lo que importa no es que el balón sea suyo, sino cómo lo aprieta. El verbo se quedó corto respecto de lo que ocurre.",
    porqueNo: [
      { verboId: "soltaba", texto: "«No lo soltaba» es la mitad buena de la frase: ahí sí hay resistencia. Déjalo." },
    ],
    reemplazos: [
      { id: "balon-1", texto: "abrazaba", ok: true, porque: "Brazos, pecho y miedo a perderlo en un solo verbo; y encima rima con el «no lo soltaba» que sigue." },
      { id: "balon-2", texto: "poseía", ok: false, porque: "Vocabulario de contrato. Aleja al lector justo cuando había que acercarlo al niño." },
      { id: "balon-3", texto: "conservaba", ok: false, porque: "Suena a museo: correcto de diccionario, inerte en la escena." },
    ],
    resultado: "El niño abrazaba el balón contra el pecho y no lo soltaba aunque ya hubiera terminado el partido.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Glosario — VERBATIM de LC-II-P02-A5 (términos, definiciones y ejemplos).
 * Lo usa el modo «Escribe el término».
 * ═══════════════════════════════════════════════════════════════════════════ */

export const GLOSARIO: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "g1",
    termino: "Organización de ideas",
    definicion: "Ordenar lo que se va a escribir antes y durante la redacción.",
    ejemplo: "Hacer una lista o un esquema de los puntos del texto.",
  },
  {
    id: "g2",
    termino: "Sentido comunicativo",
    definicion: "Propósito o intención con la que se escribe un texto.",
    ejemplo: "Narrar una anécdota para emocionar al lector.",
  },
  {
    id: "g3",
    termino: "Borrador",
    definicion: "Primera versión de un texto que luego se revisa y corrige.",
    ejemplo: "Un escrito inicial con tachones y notas al margen.",
  },
  {
    id: "g4",
    termino: "Texto descriptivo",
    definicion: "Texto cuyo propósito es mostrar cómo son personas, lugares u objetos.",
    ejemplo: "La descripción de un paisaje.",
  },
  {
    id: "g5",
    termino: "Texto narrativo",
    definicion: "Texto que relata hechos o sucesos en una secuencia temporal.",
    ejemplo: "Un cuento o una anécdota.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Hechos verdadero/falso — VERBATIM de LC-II-P02-A4.
 * ═══════════════════════════════════════════════════════════════════════════ */

export const HECHOS: { enunciado: string; respuesta: boolean; retro: string }[] = [
  {
    enunciado: "Antes de escribir conviene organizar las ideas con un esquema, lista o borrador.",
    respuesta: true,
    retro: "Correcto: planear ayuda a ordenar lo que se quiere decir.",
  },
  {
    enunciado: "El sentido comunicativo de un texto es la intención o propósito con que se escribe.",
    respuesta: true,
    retro: "Correcto: informar, narrar, describir, convencer, emocionar, etc.",
  },
  {
    enunciado: "Un texto bien hecho no necesita revisión ni corrección.",
    respuesta: false,
    retro: "Revisar y corregir el borrador mejora la claridad del texto.",
  },
  {
    enunciado: "Un texto puede ser descriptivo, narrativo o combinar ambos según lo que se quiera comunicar.",
    respuesta: true,
    retro: "Correcto: la forma depende del propósito comunicativo.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Reto evaluable — VERBATIM de LC-II-P02-A2 (quiz de opción múltiple).
 * ═══════════════════════════════════════════════════════════════════════════ */

export const RETO_QUIZ: QuizEvaluable = {
  titulo: "Características del texto narrativo y descriptivo",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Cuál es el elemento que genera el movimiento de la trama en un texto narrativo?",
      opciones: ["El escenario", "El narrador", "El conflicto", "El tiempo verbal"],
      respuestaCorrecta: 2,
      retroalimentacion: "El conflicto es la fuerza que impulsa la trama y crea tensión narrativa.",
    },
    {
      enunciado: "¿Qué tono narrativo predomina en los textos irónicos?",
      opciones: [
        "Dramático y solemne",
        "Distanciado, señalando contradicciones entre lo dicho y lo real",
        "Humorístico y festivo",
        "Misterioso y suspensivo",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "La ironía presenta lo contrario de lo que se quiere decir, creando distancia reflexiva.",
    },
    {
      enunciado: "¿Qué diferencia a un texto narrativo de uno descriptivo?",
      opciones: [
        "El narrativo cuenta eventos en el tiempo; el descriptivo presenta características sin acción",
        "El narrativo usa más adjetivos que el descriptivo",
        "El descriptivo tiene personajes y el narrativo no",
        "No hay diferencia real entre ambos",
      ],
      respuestaCorrecta: 0,
      retroalimentacion: "El texto narrativo relata eventos con inicio, desarrollo y desenlace; el descriptivo retrata características estáticas.",
    },
    {
      enunciado: "¿Cuál de estos es un ejemplo de texto narrativo?",
      opciones: [
        "Una descripción del paisaje de una ciudad",
        "Un cuento sobre una aventura en el bosque",
        "Un manual de instrucciones",
        "Un artículo de opinión",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "El cuento relata eventos con personajes y trama: es el ejemplo clásico de texto narrativo.",
    },
    {
      enunciado: "¿Qué función tiene el escenario en un texto narrativo?",
      opciones: [
        "Solo decorativa: no afecta la trama",
        "Sitúa la acción en tiempo y espacio y puede influir en los personajes y la trama",
        "Es el personaje principal de la historia",
        "Reemplaza al narrador",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "El escenario contextualiza la acción y puede reflejar o influir en el estado de los personajes.",
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
 * Taller final — VERBATIM de LC-II-P02-A3 (reflexión escrita).
 * No se califica y el laboratorio lo dice en pantalla.
 * ═══════════════════════════════════════════════════════════════════════════ */

export const TALLER = {
  ancla: "LC-II-P02-A3 · Escribo mi primer texto narrativo",
  prompt:
    "Escribe un texto narrativo o descriptivo de tu propia autoría. Puede ser: (a) una narración breve sobre algo que viviste o imaginaste, (b) una descripción detallada de un lugar, persona o momento. Asegúrate de incluir: un inicio que capte la atención, un desarrollo con detalles y un cierre que genere una reflexión o imagen final.",
  pistas: [
    "Elige un tono: ¿quieres que sea humorístico, dramático, misterioso?",
    "Si es narrativo: incluye un conflicto, aunque sea pequeño.",
    "Si es descriptivo: usa comparaciones (metáforas, símiles) para que el lector visualice.",
  ],
  criterios: [
    "El texto tiene un inicio, desarrollo y cierre diferenciados",
    "Incluye detalles específicos (no genéricos)",
    "El tono elegido es coherente a lo largo del texto",
    "Hay al menos un recurso expresivo (comparación, pregunta retórica, enumeración)",
  ],
  minimo: 120,
  maximo: 400,
} as const;

/**
 * Comodines que el taller señala en el borrador del alumno.
 *
 * NO es una calificación y el laboratorio lo dice: es la misma lista de verbos
 * del modo 4 aplicada al texto propio, para que quien escriba vea dónde le
 * pasa a él lo que acaba de detectar en las frases de otros. Se buscan con
 * espacios alrededor para no marcar «estaba» dentro de otra palabra.
 */
export const COMODINES: { raiz: string; formas: string[] }[] = [
  { raiz: "hacer", formas: ["hizo", "hacia", "hacen", "hacer", "hace"] },
  { raiz: "haber", formas: ["habia", "hubo", "hay"] },
  { raiz: "estar", formas: ["estaba", "estaban", "esta", "estuvo"] },
  { raiz: "poner", formas: ["puso", "ponia", "pusieron", "poner"] },
  { raiz: "tener", formas: ["tenia", "tuvo", "tienen", "tener", "tiene"] },
  { raiz: "ser", formas: ["era", "eran", "fue", "es", "son"] },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Lectura A1 — preguntas de comprensión y dato, VERBATIM.
 * ═══════════════════════════════════════════════════════════════════════════ */

export const COMPRENSION_A1: { pregunta: string; guia: string }[] = [
  {
    pregunta: "¿Cuáles son los tres momentos de la estructura narrativa y qué función cumple cada uno?",
    guia: "Situación inicial (presenta personajes, tiempo y espacio), nudo (conflicto que genera tensión) y desenlace (resolución del conflicto).",
  },
  {
    pregunta: "¿Qué diferencia hay entre un narrador omnisciente y un narrador en primera persona?",
    guia: "El omnisciente conoce los pensamientos de todos los personajes y no tiene límites de perspectiva; el de primera persona solo conoce su propia experiencia y la cuenta desde adentro.",
  },
  {
    pregunta: "¿Para qué sirven los conectores temporales en un texto narrativo?",
    guia: "Organizan la secuencia de eventos, marcan relaciones temporales entre ellos y guían al lector a través del tiempo de la historia.",
  },
];

/** Callout «¿Sabías?» de LC-II-P02-A1, verbatim. */
export const DATO_RULFO =
  "Juan Rulfo escribió su cuento con un narrador en tercera persona; el padre que carga a su hijo nunca recibe un nombre propio. Esa ausencia de nombre refuerza la universalidad del dolor que describe: podría ser cualquier padre en cualquier lugar de México.";
