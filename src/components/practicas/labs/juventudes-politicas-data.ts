/**
 * Datos del Laboratorio — Las juventudes como sujetos políticos
 * (CS-III-P03, Ciencias Sociales III).
 *
 * Contenido VERBATIM de CS-III·P03 ("Las juventudes como sujetos políticos").
 * Las formas de participación, los conceptos, las definiciones del glosario y las
 * afirmaciones del cuestionario se toman literalmente de las actividades A1
 * (lectura), A2 (quiz de opción múltiple), A4 (V/F) y A5 (glosario interactivo).
 * Los ejemplos a clasificar son casos que las propias actividades describen.
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿Electoral, comunitaria, cultural o digital? (clasifica las formas
 * de participación política juvenil que A1, A2 y A5 describen).
 * ───────────────────────────────────────────────────────────────────────── */
export type Categoria = "electoral" | "comunitaria" | "cultural" | "digital";

export const CATEGORIA_INFO: Record<
  Categoria,
  { titulo: string; subtitulo: string; icono: string }
> = {
  electoral: {
    titulo: "Participación electoral",
    subtitulo: "El voto y los mecanismos formales: votar en elecciones y consultas, poder ser votado y asociarse para tomar parte en los asuntos políticos del país (Art. 35).",
    icono: "fa-square-poll-vertical",
  },
  comunitaria: {
    titulo: "Participación comunitaria",
    subtitulo: "Involucramiento en la vida colectiva del barrio o comunidad: brigadas, comités, cooperativas, asambleas y redes de ayuda mutua.",
    icono: "fa-handshake-angle",
  },
  cultural: {
    titulo: "Participación cultural",
    subtitulo: "Usar el arte, la música, el grafiti o la cultura popular para expresar demandas, visibilizar injusticias y construir identidades colectivas.",
    icono: "fa-palette",
  },
  digital: {
    titulo: "Activismo digital",
    subtitulo: "Usar plataformas y redes sociales para difundir causas, movilizar apoyos y presionar a autoridades, articulado con acciones presenciales.",
    icono: "fa-hashtag",
  },
};

export const EJEMPLOS: { id: string; texto: string; categoria: Categoria }[] = [
  { id: "ej-e1", texto: "Votar en las elecciones presidenciales a partir de los 18 años", categoria: "electoral" },
  { id: "ej-e2", texto: "Poder ser votado para un cargo de elección popular", categoria: "electoral" },
  { id: "ej-c1", texto: "Integrarse a brigadas comunitarias de limpieza y comités de seguridad vecinal", categoria: "comunitaria" },
  { id: "ej-c2", texto: "Participar en cooperativas juveniles y asambleas barriales", categoria: "comunitaria" },
  { id: "ej-u1", texto: "Usar el rap y el grafiti para denunciar injusticias", categoria: "cultural" },
  { id: "ej-u2", texto: "Crear murales que reivindican los derechos de las comunidades", categoria: "cultural" },
  { id: "ej-d1", texto: "Difundir un hashtag que amplifica una demanda social", categoria: "digital" },
  { id: "ej-d2", texto: "Organizarse y comunicarse por redes sociales, como hizo #YoSoy132", categoria: "digital" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Empareja concepto y definición (conceptos clave de A2, verbatim).
 * ───────────────────────────────────────────────────────────────────────── */
export const CONCEPTOS: { id: string; concepto: string; definicion: string; ejemplo: string }[] = [
  {
    id: "co-agencia",
    concepto: "Agencia política",
    definicion: "La capacidad de los jóvenes para actuar de forma deliberada, organizada y con propósito en la esfera pública, influyendo en las decisiones colectivas que afectan sus vidas.",
    ejemplo: "Implica reconocer que los jóvenes no actúan solo por impulso o influencia de otros: tienen capacidad de reflexión, organización y acción propia.",
  },
  {
    id: "co-sujeto",
    concepto: "Sujeto histórico",
    definicion: "Las juventudes son actores que producen historia: sus acciones, demandas y formas de organización transforman las sociedades, no son solo receptores pasivos de la cultura adulta.",
    ejemplo: "El #YoSoy132, el movimiento estudiantil del 68 o las marchas feministas encabezadas por jóvenes modificaron el curso político de México.",
  },
  {
    id: "co-cultural",
    concepto: "Participación cultural",
    definicion: "Usar el arte, la música, el grafiti, las redes sociales o la cultura popular como medios para expresar demandas políticas, visibilizar injusticias y construir identidades colectivas.",
    ejemplo: "El rap que denuncia la violencia policial, los murales que reivindican derechos y los memes que critican al poder.",
  },
  {
    id: "co-comunitaria",
    concepto: "Participación comunitaria",
    definicion: "Integrarse a brigadas comunitarias de limpieza, comités de seguridad vecinal, redes de ayuda mutua o proyectos culturales en el barrio o comunidad.",
    ejemplo: "Construye capital social y se reconoce en instrumentos como la Ley General de Desarrollo Social y la Ley de la Juventud de cada entidad.",
  },
  {
    id: "co-art35",
    concepto: "Artículo 35 de la CPEUM",
    definicion: "Establece que son derechos del ciudadano votar en las elecciones y consultas populares, poder ser votado para cargos de elección popular, y asociarse individual y libremente para tomar parte en los asuntos políticos del país.",
    ejemplo: "El derecho a ser votado y a asociarse políticamente se adquiere al cumplir 18 años (ciudadanía plena).",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim).
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-sujeto",
    termino: "Sujeto histórico",
    definicion: "Actor individual o colectivo que protagoniza y transforma los procesos históricos, no como mero receptor pasivo sino como agente activo de cambio.",
    ejemplo: "Las y los estudiantes del 68 en México fueron sujetos históricos que desafiaron el autoritarismo y abrieron camino a la democratización del país.",
  },
  {
    id: "gl-agencia",
    termino: "Agencia juvenil",
    definicion: "Capacidad de las personas jóvenes para tomar decisiones, organizarse, reflexionar críticamente y actuar sobre su entorno social, político y cultural.",
    ejemplo: "Cuando un grupo de jóvenes diseña y ejecuta una campaña de concientización sobre violencia de género en su escuela, ejercen agencia juvenil.",
  },
  {
    id: "gl-construccion",
    termino: "Construcción social de la juventud",
    definicion: "Proceso mediante el cual una sociedad define qué es ser joven, cuáles son sus roles, derechos y expectativas, determinado por el contexto histórico, cultural y socioeconómico.",
    ejemplo: "En comunidades rurales indígenas, el paso a la «adultez» puede ocurrir a los 15 años; en contextos urbanos de clase media, la «juventud» puede extenderse hasta los 30.",
  },
  {
    id: "gl-participacion",
    termino: "Participación política juvenil",
    definicion: "Conjunto de acciones mediante las cuales las personas jóvenes intervienen en los asuntos públicos: voto, militancia, activismo, organización comunitaria, expresión cultural o digital.",
    ejemplo: "Las marchas estudiantiles por la educación pública, el movimiento #MeToo en universidades y los foros juveniles de consulta de políticas públicas.",
  },
  {
    id: "gl-activismo",
    termino: "Activismo digital",
    definicion: "Uso de plataformas y herramientas digitales para difundir causas, movilizar apoyos, organizar acciones colectivas y presionar a autoridades o empresas.",
    ejemplo: "#FridaysForFuture comenzó con la campaña digital de Greta Thunberg y movilizó a millones de jóvenes en todo el mundo hacia la acción climática presencial.",
  },
  {
    id: "gl-diversidad",
    termino: "Diversidad juvenil",
    definicion: "Reconocimiento de que no existe una juventud homogénea: las experiencias juveniles varían según género, clase social, etnicidad, región, orientación sexual y contexto cultural.",
    ejemplo: "La juventud indígena en Oaxaca enfrenta condiciones y formas de participación muy distintas a las de la juventud urbana en la Ciudad de México.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión (V/F de A4, verbatim).
 * Renderizado como opción doble Verdadero / Falso.
 * ───────────────────────────────────────────────────────────────────────── */
export const QUIZ: {
  pregunta: string;
  opciones: [string, string];
  correcta: 0 | 1;
  retro: string;
}[] = [
  {
    pregunta: "El concepto de «juventud» es universal y estático: tiene el mismo significado en todas las culturas, épocas y contextos socioeconómicos.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. La juventud es una construcción social e histórica. Sus límites, significados, expectativas y derechos varían según la clase social, el género, la etnicidad, la cultura y el momento histórico. No existe una sola juventud, sino múltiples «juventudes».",
  },
  {
    pregunta: "Los jóvenes han sido actores históricos centrales en procesos de cambio social, como el movimiento estudiantil del 68 en México y las primaveras árabes.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. La historia demuestra que los jóvenes han encabezado movimientos sociales decisivos: el movimiento estudiantil de 1968 en México, las movilizaciones por los derechos civiles en EE. UU., las primaveras árabes o el movimiento #FridaysForFuture son ejemplos de agencia juvenil transformadora.",
  },
  {
    pregunta: "La participación política juvenil se reduce únicamente al voto en elecciones y no incluye formas culturales, digitales o comunitarias de acción.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. La participación política juvenil es multidimensional: incluye el voto, pero también el activismo digital, la organización comunitaria, la expresión artística y cultural, el voluntariado, los movimientos sociales y la incidencia en políticas públicas.",
  },
  {
    pregunta: "El activismo digital puede ser una forma efectiva de participación política juvenil cuando articula la acción en línea con movilizaciones y demandas concretas en el espacio público.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. El activismo digital es más efectivo cuando combina la difusión en redes sociales con acciones concretas: peticiones, marchas, foros, propuestas de política pública. La articulación entre lo digital y lo presencial potencia la incidencia.",
  },
  {
    pregunta: "Reconocer a las juventudes como «sujetos con agencia propia» significa que los jóvenes son responsables individuales de su situación, sin importar las condiciones estructurales en que viven.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. Reconocer la agencia juvenil no implica ignorar las condiciones estructurales (pobreza, discriminación, falta de oportunidades). Significa afirmar que los jóvenes, dentro de sus contextos, son capaces de reflexionar, organizarse e incidir en su realidad colectiva.",
  },
];

/** Dato verbatim de la lectura A1 (callout INEGI 2020). */
export const DATO_JUVENTUDES =
  "En México, el 26% de la población tiene entre 15 y 29 años (INEGI 2020). Eso significa que aproximadamente uno de cada cuatro mexicanos es joven. Sus decisiones, demandas y formas de organizarse tienen un peso demográfico y político enorme.";
