/**
 * Datos del Laboratorio — México en el mundo: procesos históricos
 * interconectados del siglo XIX al XXI (CH-II-P04, Conciencia Histórica II).
 *
 * Contenido VERBATIM de CH-II·P04. La línea del tiempo (puntos clave con sus
 * fechas exactas), las definiciones del glosario y las afirmaciones del
 * cuestionario se toman literalmente de las actividades A1 (infografía), A2
 * (quiz V/F), A4 (quiz V/F) y A5 (glosario interactivo). La clasificación por
 * siglo se deriva de las fechas que la propia A1 asigna a cada proceso.
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — La línea del tiempo conectada (ordena los procesos por su fecha)
 *
 * Los textos son los «puntos_clave» verbatim de A1. `orden` da la cronología
 * correcta (por fecha de inicio). El año visible se conserva tal cual la fuente.
 * ───────────────────────────────────────────────────────────────────────── */
export const HITOS: { id: string; orden: number; anio: string; texto: string; etapa: string }[] = [
  {
    id: "hi-reforma",
    orden: 0,
    anio: "1858–1867",
    texto: "Reforma e imperialismo: la Intervención Francesa fue consecuencia directa de la política imperialista de Napoleón III, que usó la deuda externa como pretexto para establecer un Imperio bajo Maximiliano.",
    etapa: "Siglo XIX",
  },
  {
    id: "hi-porfiriato",
    orden: 1,
    anio: "1876–1911",
    texto: "Porfiriato y primera globalización: México se integró como exportador de materias primas. La inversión extranjera construyó 20,000 km de ferrocarril y concentró la tierra.",
    etapa: "Siglo XIX–XX",
  },
  {
    id: "hi-revolucion",
    orden: 2,
    anio: "1910–1920",
    texto: "Revolución y Primera Guerra Mundial: el Telegrama Zimmermann (1917) muestra la inserción de México en la geopolítica global del conflicto.",
    etapa: "Siglo XX",
  },
  {
    id: "hi-milagro",
    orden: 3,
    anio: "1940–1970",
    texto: "Milagro mexicano y Guerra Fría: crecimiento sostenido del 6% anual. El movimiento estudiantil de 1968 y Tlatelolco ocurrieron el mismo año que el Mayo Francés.",
    etapa: "Siglo XX",
  },
  {
    id: "hi-deuda",
    orden: 4,
    anio: "1982–1994",
    texto: "Crisis de la deuda y neoliberalismo: la moratoria de pagos de 1982 fue parte de la crisis global de endeudamiento del sur. El FMI impuso ajuste estructural.",
    etapa: "Siglo XX",
  },
  {
    id: "hi-tlcan",
    orden: 5,
    anio: "1994",
    texto: "TLCAN y el «Efecto Tequila»: la crisis financiera de diciembre de 1994 se extendió a Argentina y otros países, mostrando la interconexión financiera global.",
    etapa: "Siglo XX",
  },
  {
    id: "hi-tmec",
    orden: 6,
    anio: "2020–presente",
    texto: "T-MEC, pandemia y nearshoring: la pandemia evidenció la dependencia de cadenas de suministro globales y la tensión EE.UU.-China abre oportunidades de nearshoring industrial para México.",
    etapa: "Siglo XXI",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — ¿De qué siglo es? (clasifica cada proceso por su siglo)
 *
 * Cada proceso se asigna al siglo de su inicio, según las fechas que A1 fija.
 * ───────────────────────────────────────────────────────────────────────── */
export type Siglo = "XIX" | "XX" | "XXI";

export const SIGLO_INFO: Record<
  Siglo,
  { titulo: string; subtitulo: string; icono: string }
> = {
  XIX: {
    titulo: "Siglo XIX (1800–1899)",
    subtitulo: "Reforma, imperialismo europeo y la entrada de México a la primera globalización capitalista.",
    icono: "fa-monument",
  },
  XX: {
    titulo: "Siglo XX (1900–1999)",
    subtitulo: "Revolución, milagro mexicano en la Guerra Fría, crisis de la deuda y apertura neoliberal.",
    icono: "fa-industry",
  },
  XXI: {
    titulo: "Siglo XXI (2000–presente)",
    subtitulo: "T-MEC, pandemia global y reconfiguración geopolítica EE.UU.-China.",
    icono: "fa-globe",
  },
};

export const PROCESOS: { id: string; texto: string; siglo: Siglo }[] = [
  { id: "pr-reforma", texto: "Reforma e Intervención Francesa (1858–1867)", siglo: "XIX" },
  { id: "pr-porfiriato", texto: "Inicio del Porfiriato y primera globalización (1876)", siglo: "XIX" },
  { id: "pr-revolucion", texto: "Revolución Mexicana y Telegrama Zimmermann (1910–1920)", siglo: "XX" },
  { id: "pr-milagro", texto: "Milagro mexicano y Guerra Fría (1940–1970)", siglo: "XX" },
  { id: "pr-tlatelolco", texto: "Movimiento estudiantil de 1968 (Tlatelolco)", siglo: "XX" },
  { id: "pr-deuda", texto: "Moratoria de pagos y crisis de la deuda (1982)", siglo: "XX" },
  { id: "pr-tlcan", texto: "TLCAN y «Efecto Tequila» (1994)", siglo: "XX" },
  { id: "pr-tmec", texto: "T-MEC, pandemia y nearshoring (2020–presente)", siglo: "XXI" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-multicausalidad",
    termino: "Multicausalidad histórica",
    definicion: "Principio metodológico que reconoce que los procesos históricos complejos son resultado de múltiples causas simultáneas e interrelacionadas: factores económicos, políticos, sociales, culturales, ambientales e ideológicos. Ningún gran proceso tiene una sola causa.",
    ejemplo: "La Revolución Mexicana tuvo causas múltiples: la concentración de tierras en el porfiriato (económica), el fraude electoral de 1910 (política), las condiciones laborales en haciendas y minas (social), la influencia del liberalismo y el anarquismo (ideológica) y la sequía de 1909-1910 (ambiental).",
  },
  {
    id: "gl-historiaglobal",
    termino: "Historia global e interconexión",
    definicion: "Enfoque historiográfico que analiza los procesos históricos reconociendo sus vínculos con contextos más amplios: regionales, continentales y mundiales. Ningún proceso es completamente local ni completamente global.",
    ejemplo: "El Porfiriato (1876-1910) no puede entenderse sin la conexión global: las inversiones de capital inglés y estadunidense en ferrocarriles, minería, petróleo y comunicaciones articularon a México con el mercado mundial.",
  },
  {
    id: "gl-atlanticas",
    termino: "Revoluciones Atlánticas",
    definicion: "Concepto historiográfico que agrupa las revoluciones del siglo XVIII y principios del XIX (Revolución Americana 1776, Revolución Francesa 1789, Revolución Haitiana 1804, independencias latinoamericanas) como un fenómeno interconectado de transformación política en el Atlántico.",
    ejemplo: "La Constitución de Cádiz (1812) y la Declaración de Independencia de EE.UU. (1776) influyeron en el pensamiento de los insurgentes mexicanos como Morelos.",
  },
  {
    id: "gl-imperialismo",
    termino: "Imperialismo y dependencia",
    definicion: "El imperialismo del siglo XIX-XX fue la expansión de las potencias europeas y de EE.UU. sobre territorios y economías de Asia, África y América Latina, generando relaciones de dependencia económica y política. México fue un caso típico de semicolonialismo económico.",
    ejemplo: "Durante el Porfiriato, empresas extranjeras controlaban el 70% de los ferrocarriles, la mayoría de las minas y los pozos petroleros de México.",
  },
  {
    id: "gl-guerrafria",
    termino: "Guerra Fría y América Latina",
    definicion: "Período (1947-1991) de tensión ideológica entre EE.UU. y la URSS que impactó profundamente a América Latina: golpes de Estado patrocinados, movimientos guerrilleros, Revolución Cubana (1959), y represión de movimientos sociales de izquierda bajo el pretexto anticomunista.",
    ejemplo: "En México, el gobierno del PRI utilizó el contexto de Guerra Fría para reprimir el Movimiento Estudiantil de 1968 (Tlatelolco) argumentando una amenaza comunista.",
  },
  {
    id: "gl-periodizacion",
    termino: "Periodización histórica",
    definicion: "División convencional del tiempo histórico en períodos con características comunes, definidos por rupturas o transformaciones significativas. La periodización facilita el análisis pero es una construcción del historiador, no una división natural del tiempo.",
    ejemplo: "La historia de México se periodiza en: período prehispánico, Colonia (1521-1810), Independencia y siglo XIX, Revolución y siglo XX, México contemporáneo (2000-presente).",
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
    pregunta: "La multicausalidad histórica implica que los grandes procesos (guerras, revoluciones, crisis) tienen siempre una sola causa principal que los explica completamente.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. La multicausalidad reconoce que los procesos históricos complejos son resultado de múltiples causas simultáneas: económicas, políticas, sociales, culturales e ideológicas, que se interrelacionan de manera compleja.",
  },
  {
    pregunta: "La Revolución Mexicana de 1910 puede analizarse en conexión con el contexto internacional de la época: el auge del imperialismo, la Belle Époque europea y las inversiones de capital extranjero en México durante el Porfiriato.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. La Revolución no fue un fenómeno aislado: el capital estadunidense e inglés en ferrocarriles, minería y petróleo mexicanos, así como las ideas anarquistas y socialistas en boga, influyeron en su desarrollo.",
  },
  {
    pregunta: "La Guerra Fría (1947-1991) fue un conflicto exclusivamente militar entre Estados Unidos y la URSS, sin impacto en México ni en América Latina.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. La Guerra Fría impactó profundamente a México y América Latina: el gobierno mexicano reprimió movimientos de izquierda (como en 1968) por presión de EE.UU., y la Revolución Cubana (1959) generó tensiones regionales que afectaron las políticas internas de toda la región.",
  },
  {
    pregunta: "El análisis de procesos históricos en perspectiva global permite identificar cómo fenómenos locales (como la Independencia de México) se conectan con procesos más amplios (como las Revoluciones Atlánticas del siglo XVIII-XIX).",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. La Independencia de México (1810-1821) se conecta con las Revoluciones Atlánticas: la Revolución Francesa, la Independencia de Estados Unidos (1776) y la Revolución Haitiana (1804) influyeron en las ideas y el contexto político que hicieron posible la emancipación novohispana.",
  },
  {
    pregunta: "La Ilustración del siglo XVIII fue un movimiento filosófico y científico europeo que no tuvo influencia en los procesos de independencia de América Latina.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. Las ideas ilustradas (soberanía popular, derechos naturales, separación de poderes, razón como guía del gobierno) difundidas por Locke, Rousseau, Montesquieu y Voltaire influyeron directamente en los líderes e ideólogos de las independencias latinoamericanas, incluidos los insurgentes mexicanos.",
  },
];

/** Dato verbatim de A1 (tesis de la historia conectada). */
export const DATO_MEXICO =
  "Ningún proceso histórico mexicano puede comprenderse en aislamiento. La Reforma juarista no existiría sin el liberalismo europeo; la crisis de 1982 no existiría sin la banca internacional de los 70s.";
