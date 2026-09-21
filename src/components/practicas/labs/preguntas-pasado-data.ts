/**
 * Datos y modelo del laboratorio "Preguntas al pasado: categorías históricas y
 * diversidad de discursos" (CH-I-P01, progresión 1 de Conciencia Histórica I;
 * integra CH-I-P04 como tercer modo).
 *
 * Progresión ancla CH-I-P01: «Plantea preguntas a partir de problemáticas
 * actuales en diversos contextos, implementando los conceptos y categorías
 * históricas para el análisis». CH-I-P04: «Reconoce el valor de la diversidad
 * de discursos para la construcción de explicaciones históricas».
 *
 * VERBATIM de la base de datos:
 *   - CH-I-P01-A1 lectura «¿Dónde y cuándo ocurrió? Coordenadas
 *     espacio-temporales en la historia» (5 párrafos + preguntas).
 *   - CH-I-P01-A2 quiz «líneas del tiempo y periodización histórica».
 *   - CH-I-P01-A4 V/F (hechos), A5 glosario, A6 completa el texto.
 *   - CH-I-P01-A8 y CH-I-P04-A8: preguntas abiertas de los videos.
 *   - CH-I-P04-A2/A4 V/F (hechos sobre fuentes orales y sesgo), A1/A5 glosario
 *     (testimonio, fuente oral, sesgo), A6 completa el texto.
 *
 * MODELO / ILUSTRATIVO (no verbatim):
 *   - Las pistas de cada estrato son hechos históricos verificables (con año y
 *     fuente general en la nota al pie).
 *   - Las fichas de preguntas y las preguntas de la tarjeta de estrellas son
 *     ejemplos didácticos.
 *   - Las VOCES del modo 3 son ILUSTRATIVAS: personajes verosímiles, no citas
 *     de personas reales; se apoyan en hechos documentados.
 *   - El analizador de preguntas escritas es orientativo (palabras clave).
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "excavar" | "espiral" | "voces";
export const MODOS: Modo[] = ["excavar", "espiral", "voces"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  excavar: { etq: "Del presente al pasado", subtitulo: "Excava capas de tiempo y formula preguntas", icono: "fa-person-digging", color: "#fbbf24" },
  espiral: { etq: "Categorías en el tiempo", subtitulo: "Ubica evidencias y nombra sus relaciones", icono: "fa-hurricane", color: "#38bdf8" },
  voces: { etq: "Muchas voces", subtitulo: "Un mismo proceso contado por varios discursos", icono: "fa-comments", color: "#fb7185" },
};

export function mulberry32(semilla: number) {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function baraja<X>(xs: X[], rnd: () => number): X[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function num(x: number): string {
  return Math.round(x)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/* ════════════════════════════════════════════════════════════════════════
 * Categorías históricas
 * ════════════════════════════════════════════════════════════════════════ */

export type Categoria = "tiempo" | "espacio" | "sujeto" | "cambio" | "causalidad" | "multicausalidad";
export const CATEGORIAS: Categoria[] = ["tiempo", "espacio", "sujeto", "cambio", "causalidad", "multicausalidad"];

export const CATEGORIA_DEF: Record<Categoria, { etq: string; icono: string; color: string; pregunta: string; define: string }> = {
  tiempo: {
    etq: "Tiempo y duración",
    icono: "fa-hourglass-half",
    color: "#fbbf24",
    pregunta: "¿Cuándo? ¿Cuánto duró? ¿En qué etapas?",
    define: "Ubica el hecho en su momento y distingue lo que dura días (acontecimiento) de lo que dura siglos (estructura).",
  },
  espacio: {
    etq: "Espacio",
    icono: "fa-map-location-dot",
    color: "#34d399",
    pregunta: "¿Dónde? ¿Hasta dónde? ¿Por qué rutas?",
    define: "Sitúa el proceso en un territorio que también cambia: lagos, fronteras, rutas, ciudades.",
  },
  sujeto: {
    etq: "Sujeto histórico",
    icono: "fa-people-group",
    color: "#f472b6",
    pregunta: "¿Quiénes? ¿A quién benefició o perjudicó?",
    define: "Pregunta por las personas y los grupos que actúan, deciden, trabajan o resisten, no solo por los gobernantes.",
  },
  cambio: {
    etq: "Cambio y permanencia",
    icono: "fa-arrows-rotate",
    color: "#a78bfa",
    pregunta: "¿Qué cambió? ¿Qué sigue igual?",
    define: "Compara dos momentos para ver qué se transformó y qué continúa hasta hoy.",
  },
  causalidad: {
    etq: "Causalidad",
    icono: "fa-arrow-right-long",
    color: "#38bdf8",
    pregunta: "¿Por qué ocurrió? ¿Qué consecuencias tuvo?",
    define: "Busca la relación entre un hecho y lo que lo provocó o lo que provocó después.",
  },
  multicausalidad: {
    etq: "Multicausalidad",
    icono: "fa-diagram-project",
    color: "#fb923c",
    pregunta: "¿Qué factores se combinaron?",
    define: "Reconoce que un proceso no tiene una sola causa: se combinan factores naturales, económicos, políticos y culturales.",
  },
};

/* ════════════════════════════════════════════════════════════════════════
 * 1. DEL PRESENTE AL PASADO — excavación por estratos
 * ════════════════════════════════════════════════════════════════════════ */

export type EstratoId = "hoy" | "xx" | "xix" | "virreinato" | "meso";
export const ESTRATOS: { id: EstratoId; etq: string; rango: string; color: string }[] = [
  { id: "hoy", etq: "Hoy", rango: "siglo XXI · 2001–hoy", color: "#8a7a66" },
  { id: "xx", etq: "Siglo XX", rango: "1901–2000", color: "#9c6b43" },
  { id: "xix", etq: "México independiente", rango: "siglo XIX · 1821–1900", color: "#b0834d" },
  { id: "virreinato", etq: "Virreinato", rango: "Nueva España · 1521–1821", color: "#7d5a3c" },
  { id: "meso", etq: "Mesoamérica", rango: "antes de 1521", color: "#5b4a3a" },
];

export type ProblemaId = "agua" | "lengua" | "migracion";

export type Artefacto = "bomba" | "tubo" | "canal" | "arco" | "chinampa" | "grafica" | "pupitre" | "pergamino" | "libro" | "codice" | "sobre" | "maleta" | "tren" | "carreta" | "huellas";

export interface Pista {
  anio: string;
  titulo: string;
  texto: string;
  artefacto: Artefacto;
}

export type TipoPregunta = "fertil" | "cerrada" | "anacronica";
export const TIPOS_PREGUNTA: { id: TipoPregunta; etq: string; icono: string; color: string }[] = [
  { id: "fertil", etq: "Fértil", icono: "fa-seedling", color: "#34d399" },
  { id: "cerrada", etq: "Cerrada", icono: "fa-lock", color: "#fbbf24" },
  { id: "anacronica", etq: "Anacrónica", icono: "fa-clock-rotate-left", color: "#f87171" },
];

export interface Ficha {
  texto: string;
  tipo: TipoPregunta;
  /** Categoría principal (solo fértiles). */
  categoria?: Categoria;
  porque: string;
  /** Cómo volverla fértil (cerradas y anacrónicas). */
  mejor?: string;
}

export interface Problema {
  id: ProblemaId;
  etq: string;
  icono: string;
  presente: string;
  /** Pistas por estrato, en el orden de ESTRATOS. */
  pistas: Pista[];
  fichas: Ficha[];
  /** Palabras (sin acentos) que el analizador reconoce como espacio o sujeto propios del problema. */
  lugares: string[];
  sujetos: string[];
}

export const PROBLEMAS: Problema[] = [
  {
    id: "agua",
    etq: "Agua en la Ciudad de México",
    icono: "fa-faucet-drip",
    presente: "En varias colonias el agua llega por tandeo o en pipas, y en temporada de lluvias las calles se inundan. ¿Cómo una ciudad fundada en un lago llegó a tener sed?",
    pistas: [
      { anio: "2002", titulo: "El Gran Canal ya no corre solo", texto: "El suelo de la ciudad se hunde por la extracción de agua del acuífero. El Gran Canal del Desagüe perdió su pendiente y desde 2002 necesita plantas de bombeo para que el agua avance.", artefacto: "bomba" },
      { anio: "1951 · 1975 · 1982", titulo: "Traer agua de lejos y sacarla por túneles", texto: "En 1951 el Sistema Lerma empezó a traer agua del Estado de México; en 1975 se inauguró el Emisor Central del Drenaje Profundo, y en 1982 terminó la primera etapa del Sistema Cutzamala, con agua de los límites de Michoacán.", artefacto: "tubo" },
      { anio: "1889 · 1900", titulo: "El Gran Canal del Desagüe", texto: "En 1889 el gobierno de Porfirio Díaz contrató a la empresa británica S. Pearson & Son para abrir el Gran Canal. Díaz lo inauguró el 17 de marzo de 1900, el último año del siglo XIX.", artefacto: "canal" },
      { anio: "1607 · 1629", titulo: "El desagüe de Huehuetoca y la gran inundación", texto: "En 1607 Enrico Martínez comenzó el desagüe de Huehuetoca para sacar agua de la cuenca. En 1629 la ciudad se inundó y el agua no bajó del todo sino hasta 1634.", artefacto: "arco" },
      { anio: "1325 · 1449", titulo: "Una ciudad en el lago", texto: "Según la tradición, Tenochtitlan se fundó en 1325 en un islote. Tras la inundación de 1449 se construyó el albarradón de Nezahualcóyotl, un dique que protegía la ciudad; alrededor se cultivaba en chinampas.", artefacto: "chinampa" },
    ],
    fichas: [
      { texto: "¿Por qué, desde el siglo XVII, las autoridades del Valle de México decidieron sacar el agua de la cuenca en lugar de convivir con el lago?", tipo: "fertil", categoria: "causalidad", porque: "Pregunta por las razones de una decisión, la sitúa en el tiempo (siglo XVII) y en un espacio (el Valle de México) y nombra a un sujeto (las autoridades)." },
      { texto: "¿Qué ha cambiado y qué permanece en la forma de abastecer de agua a la Ciudad de México desde el Sistema Lerma (1951) hasta hoy?", tipo: "fertil", categoria: "cambio", porque: "Compara dos momentos para distinguir lo que se transformó de lo que continúa: traer agua de otras cuencas sigue siendo la solución." },
      { texto: "¿Qué pueblos de la ribera del lago de Texcoco perdieron su forma de vida con la desecación de los siglos XVII al XX, y cómo respondieron?", tipo: "fertil", categoria: "sujeto", porque: "Pone en el centro a grupos que casi no aparecen en la historia oficial y los ubica en un espacio concreto." },
      { texto: "¿En qué año se inauguró el Gran Canal del Desagüe?", tipo: "cerrada", porque: "Se responde con un dato (1900). Es útil para ubicar el hecho, pero no abre el análisis.", mejor: "¿Qué problemas buscaba resolver el Gran Canal del Desagüe (1900) en la Ciudad de México y a quiénes benefició?" },
      { texto: "¿La Ciudad de México tiene problemas de agua?", tipo: "cerrada", porque: "Se contesta con sí o no y no pregunta por el pasado.", mejor: "¿Cómo se fue formando, desde el siglo XVII, la escasez de agua que hoy padecen muchos habitantes de la Ciudad de México?" },
      { texto: "¿Por qué los virreyes no respetaron el derecho humano al agua?", tipo: "anacronica", porque: "El derecho humano al agua lo reconoció la ONU en 2010. Juzgar el siglo XVII con una idea de nuestro tiempo es un anacronismo.", mejor: "¿Cómo se repartía el agua en la Ciudad de México virreinal y quiénes tenían acceso a ella?" },
    ],
    lugares: ["ciudad", "valle", "cuenca", "lago", "texcoco", "tenochtitlan", "xochimilco", "cdmx", "capital", "colonia", "huehuetoca", "zumpango", "lerma", "cutzamala"],
    sujetos: ["autoridades", "virrey", "virreyes", "gobierno", "vecinos", "pueblos", "pescadores", "trabajadores", "habitantes", "familias", "ingenieros", "mexicas", "indigenas", "empresa", "empresas"],
  },
  {
    id: "lengua",
    etq: "Una lengua indígena en riesgo",
    icono: "fa-language",
    presente: "En muchas familias los abuelos hablan náhuatl y los nietos ya no. ¿Por qué una lengua con siglos de historia pierde hablantes jóvenes?",
    pistas: [
      { anio: "2003 · 2020", titulo: "Lenguas nacionales y un censo", texto: "La Ley General de Derechos Lingüísticos de los Pueblos Indígenas (2003) reconoce a las lenguas indígenas como lenguas nacionales. El Censo 2020 del INEGI contó 7 364 645 hablantes de lengua indígena; 1 651 958 hablan náhuatl.", artefacto: "grafica" },
      { anio: "1948", titulo: "La escuela castellanizadora", texto: "Durante buena parte del siglo XX la escuela buscó que los pueblos indígenas aprendieran español para «integrarse» a la nación. En 1948 se creó el Instituto Nacional Indigenista.", artefacto: "pupitre" },
      { anio: "1856", titulo: "La tierra comunal en venta", texto: "La Ley Lerdo (1856) ordenó desamortizar las tierras de corporaciones, y se aplicó también a las tierras comunales de los pueblos: se debilitó la base de muchas comunidades hablantes.", artefacto: "pergamino" },
      { anio: "1536 · 1571 · 1770", titulo: "Del náhuatl de los frailes a la Real Cédula", texto: "En 1536 se fundó el Colegio de Santa Cruz de Tlatelolco, donde se estudiaba en náhuatl; en 1571 fray Alonso de Molina publicó su Vocabulario. En 1770 una Real Cédula de Carlos III ordenó extinguir las lenguas indígenas y hablar solo castellano.", artefacto: "libro" },
      { anio: "antes de 1521", titulo: "La lengua de un imperio", texto: "El náhuatl era la lengua de los mexicas y de muchos pueblos del centro de México; la memoria se registraba en códices pintados y se transmitía de forma oral.", artefacto: "codice" },
    ],
    fichas: [
      { texto: "¿Por qué la proporción de hablantes de lenguas indígenas bajó durante el siglo XX, y qué papel tuvo la escuela castellanizadora?", tipo: "fertil", categoria: "causalidad", porque: "Busca una explicación de un proceso ubicado en el tiempo y propone una causa para ponerla a prueba." },
      { texto: "¿Qué factores económicos, políticos y educativos se combinaron en el siglo XX para que muchas familias dejaran de enseñar su lengua a sus hijos?", tipo: "fertil", categoria: "multicausalidad", porque: "No supone una sola causa: pide identificar varios factores y cómo se combinaron." },
      { texto: "¿Cómo cambió la política hacia las lenguas indígenas entre la Real Cédula de 1770 y la ley de 2003?", tipo: "fertil", categoria: "cambio", porque: "Compara dos momentos lejanos para ver qué se transformó (de extinguirlas a reconocerlas) y qué dificultades continúan." },
      { texto: "¿Cuántas personas hablaban náhuatl en 2020?", tipo: "cerrada", porque: "Se responde con un dato del censo (1 651 958). Sirve como evidencia, pero no explica nada por sí sola.", mejor: "¿Cómo ha cambiado el número de hablantes de náhuatl en el último siglo y qué explica ese cambio?" },
      { texto: "¿El náhuatl es una lengua indígena?", tipo: "cerrada", porque: "Se contesta con sí o no y no pregunta por ningún proceso histórico.", mejor: "¿Quiénes han mantenido vivo el náhuatl en sus comunidades desde el siglo XVI y de qué manera?" },
      { texto: "¿Por qué la Corona española de 1770 no respetó la Ley General de Derechos Lingüísticos?", tipo: "anacronica", porque: "Esa ley es de 2003: en 1770 no existía. Pedirle al pasado que cumpla una norma del presente es un anacronismo.", mejor: "¿Qué buscaba la Corona al ordenar en 1770 que en la Nueva España solo se hablara castellano, y cómo respondieron los pueblos?" },
    ],
    lugares: ["mexico", "pueblo", "comunidad", "comunidades", "tlatelolco", "region", "nueva espana", "centro", "sierra", "escuela", "escuelas"],
    sujetos: ["hablantes", "familias", "frailes", "maestros", "pueblos", "comunidades", "corona", "gobierno", "estado", "abuelos", "jovenes", "ninos", "mexicas", "indigenas", "autoridades"],
  },
  {
    id: "migracion",
    etq: "Migrar al norte",
    icono: "fa-person-walking-luggage",
    presente: "En muchos pueblos hay casas vacías y familias que viven de lo que envían sus parientes desde Estados Unidos. ¿Desde cuándo y por qué se migra al norte?",
    pistas: [
      { anio: "2023", titulo: "Remesas récord", texto: "Según el Banco de México, en 2023 llegaron al país 63 313 millones de dólares en remesas; Guanajuato, Michoacán y Jalisco fueron los estados que más recibieron.", artefacto: "sobre" },
      { anio: "1942–1964", titulo: "El Programa Bracero", texto: "Con la Segunda Guerra Mundial, Estados Unidos necesitó trabajadores para el campo y los ferrocarriles. Entre 1942 y 1964 el Programa Bracero firmó unos 4.6 millones de contratos con trabajadores mexicanos.", artefacto: "maleta" },
      { anio: "1848 · 1884", titulo: "Una frontera nueva y un tren", texto: "Con el Tratado de Guadalupe Hidalgo (1848), al terminar la guerra con Estados Unidos, México cedió cerca de la mitad de su territorio. En 1884 llegó a Paso del Norte el primer tren del Ferrocarril Central Mexicano desde la capital.", artefacto: "tren" },
      { anio: "1591", titulo: "Familias tlaxcaltecas hacia el norte", texto: "En 1591 unas 400 familias tlaxcaltecas salieron de Tlaxcala para fundar pueblos en la frontera chichimeca, como San Esteban de la Nueva Tlaxcala, junto a Saltillo.", artefacto: "carreta" },
      { anio: "1325", titulo: "La peregrinación desde Aztlán", texto: "Los relatos mexicas, pintados en la Tira de la Peregrinación, narran su migración desde Aztlán hasta el lago donde, según la tradición, fundaron Tenochtitlan en 1325.", artefacto: "huellas" },
    ],
    fichas: [
      { texto: "¿Por qué millones de trabajadores mexicanos se contrataron como braceros entre 1942 y 1964, y quiénes se beneficiaron del programa?", tipo: "fertil", categoria: "causalidad", porque: "Busca las causas de un proceso ubicado en el tiempo y pregunta a quién benefició: abre varias líneas de análisis." },
      { texto: "¿Cómo cambió la experiencia de migrar al norte desde la llegada del Ferrocarril Central (1884) hasta hoy?", tipo: "fertil", categoria: "cambio", porque: "Compara la migración en dos momentos para ver qué se transformó y qué continúa." },
      { texto: "¿Qué papel tuvieron las familias tlaxcaltecas que en 1591 fundaron pueblos en el norte de la Nueva España?", tipo: "fertil", categoria: "sujeto", porque: "Pone en el centro a un grupo indígena como protagonista y lo ubica en un tiempo y un espacio precisos." },
      { texto: "¿Cuánto dinero llegó a México por remesas en 2023?", tipo: "cerrada", porque: "Se responde con un dato (63 313 millones de dólares). Es evidencia útil, pero no pregunta por el pasado.", mejor: "¿Qué papel han tenido las remesas en las familias y los pueblos que envían migrantes desde el Programa Bracero hasta hoy?" },
      { texto: "¿Hay migrantes en mi colonia?", tipo: "cerrada", porque: "Se contesta con sí o no y no tiene dimensión histórica.", mejor: "¿Desde cuándo y por qué las familias de mi colonia empezaron a migrar, y a dónde fueron?" },
      { texto: "¿Por qué los mexicas no tramitaron pasaporte al salir de Aztlán?", tipo: "anacronica", porque: "Los pasaportes y las fronteras nacionales son instituciones modernas: no existían en el mundo mexica. Es un anacronismo.", mejor: "¿Qué cuentan los relatos mexicas sobre su migración desde Aztlán hasta la fundación de Tenochtitlan (1325) y qué función tenía esa historia para ellos?" },
    ],
    lugares: ["norte", "frontera", "estados unidos", "mexico", "pueblo", "pueblos", "colonia", "tlaxcala", "saltillo", "aztlan", "paso del norte", "nueva espana", "region", "michoacan", "guanajuato", "jalisco"],
    sujetos: ["migrantes", "trabajadores", "braceros", "familias", "mujeres", "jovenes", "tlaxcaltecas", "mexicas", "gobierno", "empresas", "campesinos", "comunidades", "patrones", "hijos"],
  },
];

/* ── Analizador de preguntas escritas (orientativo) ────────────────────── */

export function sinAcentos(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toLowerCase();
}

const RE_TIEMPO = /\b(siglo|siglos|ano|anos|decada|decadas|desde|hasta|antes|despues|epoca|periodo|virreinato|virreinal|colonial|porfiriato|mesoamerica|prehispanic[oa]s?|independencia|revolucion|hoy|actual|duracion|duro|[12]\d{3}|xiv|xv|xvi|xvii|xviii|xix|xx|xxi)\b/;
const RE_ESPACIO_GEN = /\b(donde|lugar|lugares|territorio|region|regiones|zona|zonas|ciudad|pais|frontera|ruta|rutas|valle|barrio|estado|norte|sur|mapa)\b/;
const RE_SUJETO_GEN = /\b(quien|quienes|beneficio|beneficiaron|perjudico|perjudicaron|afecto|afectaron|grupos|personas|mujeres|trabajadores|pueblos|comunidades|gobierno|autoridades)\b/;
const RE_CAMBIO = /\b(cambio|cambios|cambiado|cambiaron|cambia|transformo|transformaron|transformacion|permanece|permanecen|permanencia|continua|continuan|continuidad|sigue|siguen|todavia|persiste|persisten|diferencia|diferencias)\b/;
const RE_CAUSA = /\b(por que|porque|causa|causo|causaron|provoco|provocaron|consecuencia|consecuencias|origen|efecto|efectos|explica|debido)\b/;
const RE_MULTI = /\b(factores|causas|condiciones|combinaron|combinacion|multiples|diversas razones|que razones)\b/;
const RE_ABIERTA = /(por que|como|de que manera|que factores|que condiciones|quienes|a quien|que papel|que consecuencias|que causas|en que medida|que cambio|que ha cambiado|que permanece|que relacion|para que|que buscaba|que problemas|que cuentan|que funcion|que significado)/;
const RE_CERRADA_INICIO = /^\s*¿?\s*(es|son|era|eran|fue|fueron|hubo|hay|existe|existio|existian|cuando|cuanto|cuantos|cuantas|en que ano|en que fecha|quien fue|donde queda|donde esta|se|tiene|tuvo)\b/;
const RE_PRESENTE = /\b(internet|celular|celulares|redes sociales|whatsapp|electricidad|electrica|electricas|derechos humanos|derecho humano|pasaporte|visa|computadora|app|aplicacion|onu|ley general|derechos linguisticos)\b/;
const RE_PASADO_REMOTO = /\b(mexicas?|aztecas?|virreyes?|virreinato|virreinal|colonial|frailes?|siglo (xvi|xvii|xviii)|mesoamerica|prehispanic[oa]s?|tenochtitlan|corona|1[3-7]\d{2})\b/;

export interface Analisis {
  veredicto: "fertil" | "casi" | "cerrada" | "anacronica" | "corta";
  categorias: Categoria[];
  consejos: string[];
}

export function analizarPregunta(texto: string, problema: Problema): Analisis {
  const t = sinAcentos(texto).replace(/[¿?¡!.,;:«»"()]/g, " ").replace(/\s+/g, " ").trim();
  const palabras = t.split(" ").filter(Boolean);
  const categorias: Categoria[] = [];
  const consejos: string[] = [];
  if (palabras.length < 3) return { veredicto: "corta", categorias, consejos: ["Escribe una pregunta completa que nombre el proceso que te interesa."] };

  const incluye = (lista: string[]) => lista.some((w) => new RegExp(`\\b${w}\\b`).test(t));
  if (RE_TIEMPO.test(t)) categorias.push("tiempo");
  if (RE_ESPACIO_GEN.test(t) || incluye(problema.lugares)) categorias.push("espacio");
  if (RE_SUJETO_GEN.test(t) || incluye(problema.sujetos)) categorias.push("sujeto");
  if (RE_CAMBIO.test(t)) categorias.push("cambio");
  if (RE_CAUSA.test(t)) categorias.push("causalidad");
  if (RE_MULTI.test(t)) categorias.push("multicausalidad");

  if (RE_PRESENTE.test(t) && RE_PASADO_REMOTO.test(t)) {
    return {
      veredicto: "anacronica",
      categorias,
      consejos: ["Parece que le pides a una época lejana algo que solo existe en la nuestra (tecnología, leyes o derechos recientes). Pregunta cómo pensaban y actuaban las personas con lo que tenían en su tiempo."],
    };
  }
  const abierta = RE_ABIERTA.test(t);
  const analitica = categorias.includes("causalidad") || categorias.includes("cambio") || categorias.includes("multicausalidad");
  if (!abierta && (RE_CERRADA_INICIO.test(t) || !analitica)) {
    return {
      veredicto: "cerrada",
      categorias,
      consejos: ["Tu pregunta se responde con un dato o con sí/no. Empieza con «¿Por qué…?», «¿Cómo cambió…?», «¿Quiénes…?» o «¿Qué factores…?» para abrir el análisis."],
    };
  }
  if (palabras.length < 6) consejos.push("Desarrolla un poco más tu pregunta: nombra el proceso, la época y a quiénes involucra.");
  if (!abierta) consejos.push("Usa un interrogativo que abra el análisis: «¿por qué?», «¿cómo cambió?», «¿quiénes?», «¿a quién benefició?», «¿qué factores?».");
  if (!categorias.includes("tiempo")) consejos.push("Agrega un marco de tiempo: un siglo, un año o un periodo («desde el siglo XVII», «entre 1942 y 1964»).");
  if (!categorias.includes("espacio") && !categorias.includes("sujeto")) consejos.push("Nombra un lugar o a las personas y grupos involucrados.");
  if (categorias.length < 3) consejos.push("Una buena pregunta combina al menos tres categorías (por ejemplo, tiempo + sujeto + causalidad).");
  const fertil = abierta && categorias.includes("tiempo") && categorias.length >= 3;
  return { veredicto: fertil ? "fertil" : "casi", categorias, consejos };
}

export const INICIOS: string[] = ["¿Por qué", "¿Cómo cambió", "¿Quiénes", "¿A quién benefició", "¿Qué factores se combinaron para que", "desde el siglo", "entre"];

/* ════════════════════════════════════════════════════════════════════════
 * 2. CATEGORÍAS EN EL TIEMPO — espiral
 * ════════════════════════════════════════════════════════════════════════ */

export const ANIO_INICIO = 1300;
export const ANIO_FIN = 2030;

export type ProcesoId = "agua" | "lengua" | "migracion";
export const PROCESO_COLOR: Record<ProcesoId, string> = { agua: "#38bdf8", lengua: "#fbbf24", migracion: "#f472b6" };
export const PROCESO_ETQ: Record<ProcesoId, string> = { agua: "Agua", lengua: "Lengua", migracion: "Migración" };

export interface Evidencia {
  id: string;
  anio: number;
  proceso: ProcesoId;
  etq: string;
  texto: string;
}

export const EVIDENCIAS: Evidencia[] = [
  { id: "tenochtitlan", anio: 1325, proceso: "agua", etq: "Tenochtitlan en el lago", texto: "Según la tradición, los mexicas fundan Tenochtitlan en un islote del lago." },
  { id: "albarradon", anio: 1449, proceso: "agua", etq: "Albarradón de Nezahualcóyotl", texto: "Tras una gran inundación se levanta un dique para proteger la ciudad." },
  { id: "tlatelolco", anio: 1536, proceso: "lengua", etq: "Colegio de Santa Cruz de Tlatelolco", texto: "Se funda un colegio donde se estudia y escribe en náhuatl." },
  { id: "tlaxcaltecas", anio: 1591, proceso: "migracion", etq: "Familias tlaxcaltecas al norte", texto: "Unas 400 familias tlaxcaltecas fundan pueblos en la frontera chichimeca." },
  { id: "huehuetoca", anio: 1607, proceso: "agua", etq: "Desagüe de Huehuetoca", texto: "Enrico Martínez empieza a abrir una salida artificial para el agua de la cuenca." },
  { id: "cedula", anio: 1770, proceso: "lengua", etq: "Real Cédula de Carlos III", texto: "La Corona ordena extinguir las lenguas indígenas y hablar solo castellano." },
  { id: "ferrocarril", anio: 1884, proceso: "migracion", etq: "Ferrocarril Central", texto: "Llega a Paso del Norte el primer tren desde la Ciudad de México." },
  { id: "grancanal", anio: 1900, proceso: "agua", etq: "Gran Canal del Desagüe", texto: "Porfirio Díaz inaugura el Gran Canal el 17 de marzo." },
  { id: "bracero", anio: 1942, proceso: "migracion", etq: "Programa Bracero", texto: "Empieza el programa de contratos de trabajadores mexicanos en Estados Unidos." },
  { id: "ley2003", anio: 2003, proceso: "lengua", etq: "Ley de Derechos Lingüísticos", texto: "Las lenguas indígenas se reconocen como lenguas nacionales." },
];

export const SIGLOS: { n: number; romano: string }[] = [
  { n: 14, romano: "XIV" },
  { n: 15, romano: "XV" },
  { n: 16, romano: "XVI" },
  { n: 17, romano: "XVII" },
  { n: 18, romano: "XVIII" },
  { n: 19, romano: "XIX" },
  { n: 20, romano: "XX" },
  { n: 21, romano: "XXI" },
];

/** Siglo de un año d.C.: el siglo N va del año (N−1)·100+1 al N·100 (no hubo año 0). */
export function sigloDe(anio: number): number {
  return Math.ceil(anio / 100);
}

export function romano(n: number): string {
  return SIGLOS.find((s) => s.n === n)?.romano ?? String(n);
}

export function explicaSiglo(anio: number): string {
  const s = sigloDe(anio);
  return `${anio} pertenece al siglo ${romano(s)}, que va de ${(s - 1) * 100 + 1} a ${s * 100}.${anio % 100 === 0 ? ` Ojo: los años terminados en 00 cierran su siglo, no abren el siguiente.` : ""}`;
}

export type Relacion = "causa" | "cambio" | "permanencia" | "larga" | "simultaneidad";
export const RELACIONES: Relacion[] = ["causa", "cambio", "permanencia", "larga", "simultaneidad"];
export const RELACION_DEF: Record<Relacion, { etq: string; icono: string; color: string; define: string }> = {
  causa: { etq: "Causa → consecuencia", icono: "fa-arrow-right-long", color: "#38bdf8", define: "Un hecho o proceso ayuda a explicar otro que ocurre después." },
  cambio: { etq: "Cambio", icono: "fa-arrows-rotate", color: "#a78bfa", define: "Entre dos momentos algo se transforma de manera notable." },
  permanencia: { etq: "Permanencia", icono: "fa-anchor", color: "#34d399", define: "Algo continúa a pesar del paso del tiempo y de los cambios alrededor." },
  larga: { etq: "Larga duración", icono: "fa-road", color: "#fbbf24", define: "Un proceso que se prolonga durante siglos y atraviesa varios periodos." },
  simultaneidad: { etq: "Simultaneidad", icono: "fa-equals", color: "#f472b6", define: "Procesos que ocurren en el mismo periodo en lugares distintos (dimensión espacio-temporal combinada)." },
};

export interface Vinculo {
  id: string;
  texto: string;
  correcta: Relacion;
  /** Años resaltados como puntos. */
  puntos: number[];
  /** Tramo resaltado sobre la espiral [desde, hasta], si lo hay. */
  tramo?: [number, number];
  porque: string;
}

export const VINCULOS: Vinculo[] = [
  {
    id: "v-lago",
    texto: "La ciudad se fundó en un islote del lago (1325) y quedó expuesta a las crecidas; tras la inundación de 1449 se levantó el albarradón.",
    correcta: "causa",
    puntos: [1325, 1449],
    porque: "Vivir dentro del lago explica que hiciera falta un dique: el primer hecho ayuda a entender el segundo.",
  },
  {
    id: "v-dique-desague",
    texto: "El albarradón (1449) contenía el agua para vivir con el lago; el desagüe de Huehuetoca (1607) busca sacarla de la cuenca.",
    correcta: "cambio",
    puntos: [1449, 1607],
    porque: "La relación con el agua se transforma: de convivir con el lago a desecarlo. Ese giro marca los siglos siguientes.",
  },
  {
    id: "v-tres-siglos",
    texto: "De 1607 a 1900 el proyecto de desaguar la cuenca atraviesa el virreinato y el México independiente.",
    correcta: "larga",
    puntos: [1607, 1900],
    tramo: [1607, 1900],
    porque: "Casi tres siglos, varios gobiernos y un mismo propósito: es un proceso de larga duración, no un acontecimiento.",
  },
  {
    id: "v-guerra-bracero",
    texto: "La Segunda Guerra Mundial (1939–1945) dejó a Estados Unidos sin suficientes trabajadores agrícolas; en 1942 comienza el Programa Bracero.",
    correcta: "causa",
    puntos: [1942],
    tramo: [1939, 1945],
    porque: "La escasez de mano de obra por la guerra es una de las causas directas del programa. (Otras condiciones, como la pobreza rural en México, también cuentan.)",
  },
  {
    id: "v-nahuatl-vivo",
    texto: "En 1536 se estudia en náhuatl en Tlatelolco; en 2003 la ley lo reconoce como lengua nacional: casi cinco siglos después sigue hablándose.",
    correcta: "permanencia",
    puntos: [1536, 2003],
    porque: "A pesar de la conquista, la Real Cédula y la castellanización, el náhuatl continúa: es una permanencia.",
  },
  {
    id: "v-politica-lengua",
    texto: "En 1770 la Corona ordena extinguir las lenguas indígenas; en 2003 una ley las declara lenguas nacionales.",
    correcta: "cambio",
    puntos: [1770, 2003],
    porque: "La política del Estado hacia las lenguas se invierte. La misma evidencia de 2003 sirve para ver un cambio o una permanencia: depende de la pregunta.",
  },
  {
    id: "v-porfiriato",
    texto: "En el mismo Porfiriato llegan el Ferrocarril Central a Paso del Norte (1884) y el Gran Canal del Desagüe al Valle de México (1900), obras hechas con capital extranjero.",
    correcta: "simultaneidad",
    puntos: [1884, 1900],
    porque: "Son procesos distintos, en lugares distintos, dentro del mismo periodo: mirarlos juntos revela el proyecto de modernización de la época.",
  },
];

/* ════════════════════════════════════════════════════════════════════════
 * 3. MUCHAS VOCES
 * ════════════════════════════════════════════════════════════════════════ */

export type CasoVocesId = "canal" | "sismo";

export type TipoVoz = "oficial" | "tecnica" | "trabajadores" | "pueblos" | "mujeres" | "prensa" | "vecinos" | "memoria";

export interface Voz {
  id: string;
  tipo: TipoVoz;
  quien: string;
  /** Nombre corto para la etiqueta de la escena. */
  corto: string;
  icono: string;
  color: string;
  /** Testimonio ILUSTRATIVO (no es cita de una persona real). */
  dice: string;
  aporta: string[];
  aportaOk: number;
  omite: string[];
  omiteOk: number;
  /** Frase que la voz aporta a una explicación integrada. */
  frase: string;
  subalterna: boolean;
}

export interface CasoVoces {
  id: CasoVocesId;
  etq: string;
  fecha: string;
  contexto: string;
  voces: Voz[];
  guias: { texto: string; clave: string[] }[];
}

export const CASOS_VOCES: CasoVoces[] = [
  {
    id: "canal",
    etq: "El Gran Canal del Desagüe",
    fecha: "1889–1900",
    contexto: "Durante el Porfiriato se abrió el Gran Canal para sacar el agua del Valle de México. Lo construyó la empresa británica S. Pearson & Son y se inauguró en 1900.",
    voces: [
      {
        id: "c-oficial",
        corto: "Oficial",
        tipo: "oficial",
        quien: "Discurso oficial",
        icono: "fa-landmark",
        color: "#94a3b8",
        dice: "Con esta obra la capital queda libre de las inundaciones que la amenazaron por siglos. Es la prueba del orden y del progreso de la nación.",
        aporta: ["La intención del gobierno y el sentido de modernización que le dio a la obra", "Cómo vivían los pescadores del lago", "Las condiciones de trabajo en la excavación"],
        aportaOk: 0,
        omite: ["A quiénes perjudicó la obra y que la ciudad siguió inundándose", "La fecha de inauguración", "Que la obra se hizo en el Valle de México"],
        omiteOk: 0,
        frase: "el gobierno la presentó como símbolo del progreso que salvaría a la capital de las inundaciones",
        subalterna: false,
      },
      {
        id: "c-tecnica",
        corto: "Ingenieros",
        tipo: "tecnica",
        quien: "Informe de ingenieros",
        icono: "fa-compass-drafting",
        color: "#38bdf8",
        dice: "El canal corre desde la ciudad hasta Zumpango y conecta con el túnel de Tequixquiac. Se usaron dragas de vapor contratadas con la casa Pearson.",
        aporta: ["El trazo, la tecnología y la empresa que hizo la obra", "Lo que sintieron las familias ribereñas", "La opinión de los vecinos del centro"],
        aportaOk: 0,
        omite: ["Las experiencias de las personas que la construyeron o la padecieron", "Por dónde pasaba el canal", "Qué máquinas se usaron"],
        omiteOk: 0,
        frase: "los ingenieros registraron su trazo hasta Zumpango y el uso de dragas de vapor de la empresa Pearson",
        subalterna: false,
      },
      {
        id: "c-peon",
        corto: "Peón",
        tipo: "trabajadores",
        quien: "Peón de la obra",
        icono: "fa-person-digging",
        color: "#fb923c",
        dice: "Cavábamos en el lodo de sol a sol, con pala y carretilla. Muchos compañeros enfermaron de fiebres; la paga apenas alcanzaba.",
        aporta: ["Quiénes hicieron el trabajo pesado y en qué condiciones", "El costo total del proyecto", "El discurso del presidente"],
        aportaOk: 0,
        omite: ["La visión de conjunto: para qué servía la obra y cómo se planeó", "Que el trabajo era duro", "Que hubo enfermedades"],
        omiteOk: 0,
        frase: "los peones que la excavaron trabajaron en el lodo, con jornadas largas y enfermedades",
        subalterna: true,
      },
      {
        id: "c-pescador",
        corto: "Pescador",
        tipo: "pueblos",
        quien: "Pescador de un pueblo ribereño",
        icono: "fa-fish",
        color: "#34d399",
        dice: "El lago nos daba pescado, patos, tule y sal. Cuando el agua se fue, nuestro pueblo perdió su sustento y muchos tuvimos que buscar trabajo en la ciudad.",
        aporta: ["La pérdida de las formas de vida lacustres de los pueblos originarios", "Los detalles técnicos del túnel", "Las cifras de la inversión"],
        aportaOk: 0,
        omite: ["Los beneficios de salud y contra inundaciones que la capital buscaba", "Que el lago daba alimento", "Que su pueblo cambió"],
        omiteOk: 0,
        frase: "los pueblos ribereños perdieron la pesca, el tule y la sal de los que vivían",
        subalterna: true,
      },
      {
        id: "c-vendedora",
        corto: "Vendedora",
        tipo: "mujeres",
        quien: "Vendedora del mercado",
        icono: "fa-basket-shopping",
        color: "#f472b6",
        dice: "Yo vendía patos y pescado del lago en el mercado. Ya no llegaba mercancía, pero también es cierto que en mi barrio hubo menos charcos de aguas negras.",
        aporta: ["Cómo cambió la vida diaria y la economía de las mujeres en los barrios", "Las decisiones del gobierno", "La forma del túnel"],
        aportaOk: 0,
        omite: ["Cómo se tomaron las decisiones y quién las tomó", "Que vendía productos del lago", "Que su barrio cambió"],
        omiteOk: 0,
        frase: "las mujeres que vendían productos del lago perdieron mercancía, aunque en los barrios hubo menos aguas estancadas",
        subalterna: true,
      },
      {
        id: "c-memoria",
        corto: "Memoria oral",
        tipo: "memoria",
        quien: "Nieta de pescadores, hoy",
        icono: "fa-comment-dots",
        color: "#a78bfa",
        dice: "Mi abuela contaba que donde hoy pasan los camiones antes había agua, y que en tiempo de secas se levantaban tolvaneras del lago seco.",
        aporta: ["Cómo se recuerda el proceso y cómo se conecta con el presente", "El contrato con la empresa", "La fecha exacta de cada obra"],
        aportaOk: 0,
        omite: ["Precisión en fechas y datos: la memoria mezcla épocas", "El recuerdo del lago", "Las tolvaneras"],
        omiteOk: 0,
        frase: "en la memoria de las familias el lago perdido sigue presente y se relaciona con problemas de hoy",
        subalterna: true,
      },
    ],
    guias: [
      { texto: "¿A quiénes benefició y a quiénes perjudicó el Gran Canal del Desagüe?", clave: ["c-oficial", "c-pescador", "c-vendedora"] },
      { texto: "¿Cómo cambió la vida en el Valle de México con el Gran Canal?", clave: ["c-pescador", "c-vendedora", "c-memoria"] },
      { texto: "¿Por qué el Porfiriato construyó el Gran Canal y quién lo hizo posible?", clave: ["c-oficial", "c-tecnica", "c-peon"] },
    ],
  },
  {
    id: "sismo",
    etq: "El sismo de 1985",
    fecha: "19 de septiembre de 1985",
    contexto: "A las 7:19 de la mañana un sismo de magnitud 8.1, con epicentro frente a la costa de Michoacán, derrumbó edificios en la Ciudad de México.",
    voces: [
      {
        id: "s-oficial",
        corto: "Oficial",
        tipo: "oficial",
        quien: "Comunicado oficial",
        icono: "fa-landmark",
        color: "#94a3b8",
        dice: "La situación está bajo control. Las instituciones atienden la emergencia y se restablecen los servicios.",
        aporta: ["La postura del gobierno y las acciones que quiso mostrar", "La organización de los vecinos", "Por qué el suelo amplificó el sismo"],
        aportaOk: 0,
        omite: ["La magnitud real de los daños y la organización espontánea de la sociedad", "Que hubo una emergencia", "Que había instituciones"],
        omiteOk: 0,
        frase: "el gobierno insistió en que la situación estaba bajo control",
        subalterna: false,
      },
      {
        id: "s-sismologa",
        corto: "Sismóloga",
        tipo: "tecnica",
        quien: "Sismóloga",
        icono: "fa-wave-square",
        color: "#38bdf8",
        dice: "El epicentro estuvo a cientos de kilómetros, pero la ciudad está sobre la arcilla del antiguo lago: ese suelo blando amplificó las ondas.",
        aporta: ["Las causas físicas de que la ciudad sufriera tanto daño", "Lo que vivieron las costureras", "Cómo se recuerda el sismo"],
        aportaOk: 0,
        omite: ["Por qué unos edificios cayeron y otros no (construcción, supervisión) y lo que vivió la gente", "Dónde fue el epicentro", "El tipo de suelo"],
        omiteOk: 0,
        frase: "la arcilla del antiguo lago amplificó las ondas de un sismo con epicentro lejano",
        subalterna: false,
      },
      {
        id: "s-costurera",
        corto: "Costurera",
        tipo: "mujeres",
        quien: "Costurera de San Antonio Abad",
        icono: "fa-scissors",
        color: "#f472b6",
        dice: "Los talleres se nos vinieron encima. Trabajábamos sin contrato ni prestaciones. Después nos organizamos y en octubre logramos el registro del sindicato 19 de Septiembre.",
        aporta: ["Las condiciones laborales ocultas que el sismo dejó al descubierto y la organización de las trabajadoras", "La magnitud del sismo", "La postura del gobierno"],
        aportaOk: 0,
        omite: ["El panorama del resto de la ciudad y las causas físicas", "Que trabajaba en un taller", "Que se organizaron"],
        omiteOk: 0,
        frase: "las costureras de San Antonio Abad revelaron que trabajaban sin derechos y se organizaron en un sindicato",
        subalterna: true,
      },
      {
        id: "s-brigadista",
        corto: "Brigadista",
        tipo: "vecinos",
        quien: "Brigadista voluntario",
        icono: "fa-hands-holding-circle",
        color: "#34d399",
        dice: "Antes de que llegara ayuda formal, los vecinos ya estábamos quitando escombro con las manos y haciendo cadenas para pasar cubetas.",
        aporta: ["La solidaridad y la organización ciudadana en el rescate", "Los datos del epicentro", "El registro del sindicato"],
        aportaOk: 0,
        omite: ["La coordinación técnica y los datos del conjunto de la ciudad", "Que hubo voluntarios", "Que se retiró escombro"],
        omiteOk: 0,
        frase: "vecinos y voluntarios se organizaron para rescatar personas antes de que llegara la ayuda formal",
        subalterna: true,
      },
      {
        id: "s-prensa",
        corto: "Prensa",
        tipo: "prensa",
        quien: "Nota de prensa",
        icono: "fa-newspaper",
        color: "#fbbf24",
        dice: "Se derrumbaron el edificio Nuevo León en Tlatelolco, el Hotel Regis y parte del Hospital Juárez. Las cifras de víctimas aún son preliminares.",
        aporta: ["Un registro inmediato de lugares y hechos, con cifras todavía inciertas", "Lo que explica la ciencia del suelo", "La memoria de hoy"],
        aportaOk: 0,
        omite: ["Lo que no alcanzó a ver y el sesgo de su línea editorial", "Qué edificios cayeron", "Que había cifras preliminares"],
        omiteOk: 0,
        frase: "la prensa registró los derrumbes del edificio Nuevo León, el Hotel Regis y el Hospital Juárez",
        subalterna: false,
      },
      {
        id: "s-memoria",
        corto: "Memoria oral",
        tipo: "memoria",
        quien: "Vecino de Tlatelolco, hoy",
        icono: "fa-comment-dots",
        color: "#a78bfa",
        dice: "Cada 19 de septiembre suena la alerta del simulacro y me acuerdo. En 2017 tembló otra vez el mismo día, y a veces ya no sé qué recuerdo es de cuál año.",
        aporta: ["El significado que el sismo tiene hoy en la memoria colectiva", "El contrato de los talleres", "La magnitud exacta"],
        aportaOk: 0,
        omite: ["Precisión: la memoria mezcla 1985 y 2017", "Que hay simulacros", "Que tembló en 2017"],
        omiteOk: 0,
        frase: "para quienes lo vivieron sigue siendo una memoria viva que se renueva cada 19 de septiembre",
        subalterna: true,
      },
    ],
    guias: [
      { texto: "¿Por qué el sismo de 1985 causó tanto daño en la Ciudad de México?", clave: ["s-sismologa", "s-prensa", "s-costurera"] },
      { texto: "¿Quiénes respondieron a la emergencia y cómo?", clave: ["s-oficial", "s-brigadista", "s-costurera"] },
      { texto: "¿Qué cambió en la sociedad después del sismo?", clave: ["s-costurera", "s-brigadista", "s-memoria"] },
    ],
  },
];

/**
 * Orden de las opciones de «aporta»/«omite» barajadas con una semilla fija por
 * voz, para que la opción correcta no quede siempre en el mismo lugar.
 */
export function ordenOpciones(vozId: string, n: number, sal: number): number[] {
  let semilla = sal;
  for (const ch of vozId) semilla = (semilla * 31 + ch.charCodeAt(0)) >>> 0;
  return baraja(
    Array.from({ length: n }, (_, i) => i),
    mulberry32(semilla),
  );
}

export interface Rubrica {
  inclusion: boolean;
  diversidad: boolean;
  contraste: boolean;
  fundamentacion: boolean;
  pertinencia: boolean;
}

export function evaluarExplicacion(caso: CasoVoces, incluidas: string[], identificadas: string[], guia: number | null): Rubrica {
  const voces = caso.voces.filter((v) => incluidas.includes(v.id));
  const tipos = new Set(voces.map((v) => v.tipo));
  const g = guia === null ? null : caso.guias[guia]!;
  return {
    inclusion: voces.length >= 3,
    diversidad: tipos.size >= 3 && voces.some((v) => v.subalterna),
    contraste: voces.some((v) => !v.subalterna) && voces.some((v) => v.subalterna),
    fundamentacion: voces.length > 0 && voces.every((v) => identificadas.includes(v.id)),
    pertinencia: g !== null && voces.some((v) => g.clave.includes(v.id)),
  };
}

export function textoExplicacion(caso: CasoVoces, incluidas: string[]): string {
  const voces = caso.voces.filter((v) => incluidas.includes(v.id));
  if (voces.length === 0) return "";
  const conectores = ["Por un lado,", "Al mismo tiempo,", "En cambio,", "Además,", "Por otra parte,", "Finalmente,"];
  return voces.map((v, i) => `${conectores[Math.min(i, conectores.length - 1)]} ${v.frase} (${v.quien.toLowerCase()}).`).join(" ");
}

/* ════════════════════════════════════════════════════════════════════════
 * Estrellas — ¿qué categoría usa esta pregunta?
 * ════════════════════════════════════════════════════════════════════════ */

export const PREGUNTAS_CATEGORIA: { texto: string; categoria: Categoria; porque: string }[] = [
  { texto: "¿Cuánto tiempo duró el proyecto de desaguar el Valle de México y en qué etapas se puede dividir?", categoria: "tiempo", porque: "Pregunta por la duración y la periodización del proceso." },
  { texto: "¿Durante cuántos años estuvo vigente el Programa Bracero y qué etapas tuvo?", categoria: "tiempo", porque: "Pide medir la duración y distinguir etapas." },
  { texto: "¿Hasta dónde llegaba el lago de Texcoco en 1519 y qué zonas de la ciudad actual cubría?", categoria: "espacio", porque: "Pide reconstruir un territorio que ya no existe y compararlo con el mapa de hoy." },
  { texto: "¿Qué rutas siguieron y en qué regiones del norte se asentaron las familias tlaxcaltecas en 1591?", categoria: "espacio", porque: "El centro de la pregunta son las rutas y las regiones." },
  { texto: "¿Quiénes excavaron el Gran Canal del Desagüe y en qué condiciones trabajaban?", categoria: "sujeto", porque: "Pone en el centro a las personas que hicieron la obra." },
  { texto: "¿A quiénes benefició y a quiénes perjudicó la desecación del lago de Texcoco?", categoria: "sujeto", porque: "Pregunta por los grupos que ganaron y perdieron con el proceso." },
  { texto: "¿Qué ha cambiado y qué sigue igual en la vida de los hablantes de náhuatl desde el siglo XIX?", categoria: "cambio", porque: "Pide comparar dos momentos para ver transformaciones y continuidades." },
  { texto: "¿Qué permanece de las chinampas mesoamericanas en el Xochimilco de hoy?", categoria: "cambio", porque: "Busca lo que continúa desde el pasado hasta el presente." },
  { texto: "¿Por qué se ordenó abrir el desagüe de Huehuetoca en 1607?", categoria: "causalidad", porque: "Busca la razón que explica una decisión concreta." },
  { texto: "¿Qué consecuencias tuvo el Tratado de Guadalupe Hidalgo (1848) para las familias que vivían en los territorios cedidos?", categoria: "causalidad", porque: "Pregunta por los efectos de un hecho." },
  { texto: "¿Qué factores naturales, técnicos y políticos se combinaron para que la inundación de 1629 durara años?", categoria: "multicausalidad", porque: "Pide identificar varios factores que actuaron juntos." },
  { texto: "¿Qué condiciones económicas, familiares y políticas explican la migración de mexicanos a Estados Unidos en el siglo XXI?", categoria: "multicausalidad", porque: "No busca una sola causa, sino un conjunto de condiciones." },
];

/** Una ronda: una pregunta por categoría, en orden aleatorio. */
export function rondaCategorias(rnd: () => number): number[] {
  const elegidas = CATEGORIAS.map((c) => {
    const idx = PREGUNTAS_CATEGORIA.map((p, i) => ({ p, i })).filter((x) => x.p.categoria === c);
    return idx[Math.floor(rnd() * idx.length)]!.i;
  });
  return baraja(elegidas, rnd);
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "¿Dónde y cuándo ocurrió? Coordenadas espacio-temporales en la historia";

/** CH-I-P01-A1 lectura — cinco párrafos, verbatim. */
export const LECTURA_A1: string[] = [
  "La historia no ocurre en el vacío. Todo evento histórico sucede en algún lugar y en algún momento: tiene coordenadas espacio-temporales. Aprender a ubicar los hechos del pasado con precisión en el espacio y en el tiempo es una de las habilidades más básicas —y más poderosas— del pensamiento histórico.",
  "La dimensión temporal nos pregunta cuándo ocurrió algo. Para responderla, los historiadores usan sistemas de datación: el calendario gregoriano, que es el más extendido hoy en el mundo occidental, organiza el tiempo en años antes y después de Cristo (a.C. y d.C.) y divide la historia en grandes períodos o eras. Así, la caída del Imperio Romano de Occidente (476 d.C.) marca convencionalmente el fin de la Antigüedad y el inicio de la Edad Media. En México, aprendemos que la Independencia se consumó en 1821, la Revolución inició en 1910 y que las civilizaciones mesoamericanas como Teotihuacán florecieron entre el 100 a.C. y el 650 d.C. Sin estas fechas, los hechos flotan sin ancla.",
  "Las líneas del tiempo son la herramienta visual clásica para organizar esa información. Una línea del tiempo puede ser general (toda la historia de la humanidad) o específica (solo la historia de México, o solo la historia de tu ciudad). Lo importante es que muestre relaciones: qué pasó antes, qué pasó después y, sobre todo, qué ocurrió al mismo tiempo en distintos lugares. Por ejemplo, mientras en México se construía Teotihuacán (siglos II-VII), en Europa el Imperio Romano alcanzaba su cenit y declinaba.",
  "La dimensión espacial nos pregunta dónde ocurrió algo. Los mapas históricos son indispensables porque los territorios cambian: las fronteras se trazan y se borran, los nombres de las ciudades se modifican, los imperios se expanden y se contraen. El México de hoy no tiene las mismas fronteras que la Nueva España del siglo XVII ni que el Imperio Azteca del siglo XV. Un mapa histórico del valle de México en 1519 muestra el lago de Texcoco, Tenochtitlán y sus ciudades aliadas: un paisaje completamente diferente al de la Ciudad de México actual.",
  "Combinar ambas dimensiones —espacio y tiempo— es lo que permite construir una comprensión genuina del pasado. Los historiadores usan matrices espacio-temporales, mapas con líneas del tiempo integradas y sistemas de información geográfica histórica (SIG histórico) para analizar cómo los eventos se relacionan no solo en secuencia, sino también en distancia y contexto geográfico.",
];

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS: string[] = [
  "¿Qué son las coordenadas espacio-temporales de un evento histórico y por qué son importantes?",
  "¿Qué información adicional aporta un mapa histórico comparado con un mapa geográfico actual?",
  "¿Por qué es útil comparar lo que ocurría simultáneamente en distintos lugares del mundo?",
  "Menciona un ejemplo concreto del texto donde cambiar la escala espacial o temporal cambia la comprensión de un evento.",
];

/** Preguntas abiertas de los videos A8 — verbatim. */
export const VIDEO_P01 = "¿Cómo puede una problemática actual convertirse en el punto de partida para una pregunta histórica?";
export const VIDEO_P04 = "¿Qué ocurre con nuestra comprensión de un hecho histórico cuando solo consideramos un único discurso o punto de vista?";

/** Hechos: CH-I-P01-A4 y CH-I-P04-A2/A4 (verdadero/falso) con su retroalimentación, verbatim. */
export const HECHOS: string[] = [
  "Verdadero: «Una línea del tiempo es una herramienta que permite ubicar eventos históricos en orden cronológico, representando el tiempo de forma lineal». La línea del tiempo organiza eventos según su fecha, permitiendo visualizar la secuencia y la distancia temporal entre ellos.",
  "Falso: «El espacio geográfico no influye en el desarrollo de los procesos históricos; solo importa el tiempo en que ocurren». El espacio geográfico condiciona profundamente los procesos históricos: los recursos naturales, las fronteras, los climas y las rutas comerciales moldean las decisiones humanas y el devenir de las sociedades.",
  "Verdadero: «La periodización histórica consiste en dividir el tiempo en etapas o períodos con características comunes para facilitar su estudio». Los historiadores dividen el tiempo en períodos (Prehistoria, Edad Antigua, Media, Moderna, Contemporánea) según criterios políticos, económicos o culturales, para organizar y comparar procesos.",
  "Falso: «La fecha exacta de un evento histórico es suficiente para comprenderlo en su totalidad; no es necesario conocer el contexto espacial ni social». La fecha proporciona la ubicación temporal, pero comprender un evento requiere también conocer el espacio geográfico, las condiciones sociales, económicas y culturales que lo rodearon.",
  "Verdadero: «El mapa histórico es una fuente que permite situar espacialmente los procesos históricos, mostrando fronteras, rutas y territorios según una época determinada». Los mapas históricos muestran cómo era el territorio en un momento específico y ayudan a comprender expansiones, conquistas, migraciones y relaciones entre sociedades.",
  "Falso: «Las fuentes orales (testimonios, tradiciones, mitos) no tienen valor histórico porque no están escritas y, por tanto, no son confiables». Las fuentes orales son reconocidas como evidencia histórica válida, especialmente para comunidades sin tradición escrita. Requieren el mismo análisis crítico que las escritas, pero aportan perspectivas únicas sobre el pasado.",
  "Verdadero: «El sesgo en una fuente histórica no la invalida automáticamente; el historiador puede usarla reconociendo su perspectiva y limitaciones». Toda fuente tiene un punto de vista (ideológico, de clase, de género, cultural). El historiador no descarta fuentes sesgadas; las analiza críticamente, las cruza con otras y considera el contexto de su producción.",
];

/** Glosario: CH-I-P01-A5 (seis términos) y tres términos de CH-I-P04 (A1 y A5) — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  {
    termino: "Coordenadas espacio-temporales",
    definicion: "Par de referencias —tiempo (cuándo) y espacio (dónde)— que permiten situar con precisión un evento o proceso histórico en su contexto de desarrollo.",
    ejemplo: "La Revolución Mexicana se ubica temporalmente entre 1910 y 1920, y espacialmente en el territorio mexicano, con epicentros en el norte (Chihuahua) y el sur (Morelos).",
  },
  {
    termino: "Cronología",
    definicion: "Ciencia auxiliar de la historia que establece el orden y la datación de los eventos históricos. Permite construir líneas del tiempo y secuencias de causas y efectos.",
    ejemplo: "La cronología de la Independencia de México: 1810 inicio del movimiento, 1813 Congreso de Chilpancingo, 1821 consumación de la Independencia.",
  },
  {
    termino: "Periodización",
    definicion: "División del tiempo histórico en etapas o períodos con características comunes, definidos por criterios políticos, económicos, culturales o tecnológicos.",
    ejemplo: "La historia universal se divide convencionalmente en Prehistoria, Edad Antigua, Edad Media, Edad Moderna y Edad Contemporánea.",
  },
  {
    termino: "Contexto histórico",
    definicion: "Conjunto de circunstancias políticas, económicas, sociales y culturales que rodean un evento o proceso histórico y son indispensables para comprenderlo.",
    ejemplo: "El contexto de la Revolución Francesa incluye la crisis económica, la Ilustración, las desigualdades del Antiguo Régimen y las influencias de la Independencia de EE. UU.",
  },
  {
    termino: "Línea del tiempo",
    definicion: "Herramienta gráfica que representa el paso del tiempo de forma lineal, ubicando eventos en el orden en que ocurrieron para visualizar secuencias y duraciones.",
    ejemplo: "Una línea del tiempo de la Segunda Guerra Mundial muestra desde 1939 (invasión de Polonia) hasta 1945 (rendición de Japón), con hitos intermedios.",
  },
  {
    termino: "Mapa histórico",
    definicion: "Representación cartográfica que muestra el estado de un territorio en una época determinada: fronteras políticas, rutas comerciales, distribución de pueblos y civilizaciones.",
    ejemplo: "Un mapa del Imperio Romano en el siglo II d.C. permite ver su máxima extensión territorial y las provincias que lo componían.",
  },
  {
    termino: "Testimonio",
    definicion: "Relato en primera persona de alguien que vivió o presenció un evento histórico. Puede ser oral (entrevista) o escrito (memorias, diarios, declaraciones judiciales).",
    ejemplo: "Los testimonios de sobrevivientes del Halconazo del 10 de junio de 1971 o de los campos de concentración del nazismo son ejemplos de testimonios históricos de alto valor pero que requieren análisis crítico por su subjetividad.",
  },
  {
    termino: "Fuente oral",
    definicion: "Testimonio transmitido verbalmente: entrevistas, tradiciones, leyendas, canciones. Son especialmente valiosas para estudiar comunidades sin tradición escrita o perspectivas subalternas.",
    ejemplo: "Los testimonios de sobrevivientes del terremoto de 1985 en la Ciudad de México son fuentes orales que complementan los registros escritos y fotográficos.",
  },
  {
    // En la BD (CH-I-P04-A5) dice «prejudicio»: errata corregida a «prejuicio» (así aparece en la pista de CH-I-P04-A6).
    termino: "Sesgo histórico",
    definicion: "Perspectiva, interés o prejuicio que condiciona la forma en que una fuente presenta los eventos. Todo documento tiene un punto de vista que el historiador debe identificar y considerar.",
    ejemplo: "Un parte de guerra oficial tiende a presentar las batallas favorablemente para el bando que lo redacta; el historiador debe cruzarlo con fuentes del bando contrario.",
  },
];

export const ACTIVIDAD_A5 =
  "Elige un evento histórico de México o América Latina. Ubícalo en una línea del tiempo (con al menos 3 eventos relacionados) y dibuja o describe el espacio geográfico en que ocurrió. Explica cómo el contexto espacio-temporal influyó en su desarrollo.";

export const FUENTE =
  "CEN Bachillerato — CH-I, progresión 1 (lectura A1 «Material elaborado para CEN Bachillerato — CH-I. Ejemplos: INAH, SEP Historia de México», quiz A2, V/F A4, glosario A5, texto A6, video A8) y progresión 4 (glosarios A1 y A5, V/F A2 y A4, texto A6, video A8). Hechos de las pistas: INEGI (Censo 2020), Banco de México (remesas 2023), Archivo General de la Nación y CONAGUA (obras hidráulicas), Bracero History Archive.";

export const PROBLEMA =
  "Las noticias de hoy —la falta de agua, una lengua que se pierde, las familias que migran— tienen raíces profundas. En este laboratorio excavas del presente al pasado para formular buenas preguntas históricas, ubicas las evidencias en una espiral del tiempo nombrando cómo se relacionan y escuchas un mismo proceso contado por muchas voces para construir una explicación que las integre.";

export const INSTRUCCIONES: string[] = [
  "En Del presente al pasado, elige una problemática y excava capa por capa. Clasifica las seis fichas y escribe tu propia pregunta histórica.",
  "En Categorías en el tiempo, ubica cada evidencia en su siglo y después nombra la relación que une a las evidencias resaltadas.",
  "En Muchas voces, escucha a cada voz, identifica qué aporta y qué omite y teje una explicación con al menos tres voces.",
  "Clasifica preguntas por su categoría para ganar estrellas y resuelve el quiz A2 y los dos textos para completar.",
];

export const IDEAS: string[] = [
  "Una pregunta histórica fértil parte del presente, pero se ubica en un tiempo y un espacio y abre el análisis (¿por qué?, ¿cómo cambió?, ¿quiénes?).",
  "Las preguntas cerradas se responden con un dato: sirven para ubicar, no para explicar.",
  "Juzgar el pasado con ideas, leyes o tecnologías del presente es un anacronismo.",
  "Una misma evidencia puede leerse como cambio o como permanencia: depende de la pregunta.",
  "El siglo N va del año (N−1)01 al N00: 1900 es el último año del siglo XIX.",
  "Ningún discurso cuenta todo: el oficial, el técnico, el de trabajadores, pueblos, mujeres o la memoria oral aportan y omiten cosas distintas.",
  "Una explicación histórica es más sólida cuando integra y contrasta varias voces, no cuando elige una sola «versión correcta».",
];

/** CH-I-P01-A2 «Quiz: líneas del tiempo y periodización histórica» — verbatim. */
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Quiz: líneas del tiempo y periodización histórica",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Cuál es la función principal de una línea del tiempo en el estudio de la historia?",
      opciones: [
        "Decorar los libros de texto con ilustraciones cronológicas",
        "Organizar eventos en secuencia temporal para visualizar relaciones de anterioridad, posterioridad y simultaneidad",
        "Demostrar que la historia avanza siempre hacia el progreso",
        "Reemplazar los mapas geográficos en el análisis histórico",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "La línea del tiempo es una herramienta de organización visual que permite ver qué ocurrió antes y después de cada evento, y especialmente qué sucedía al mismo tiempo en distintos lugares, revelando conexiones y contextos que el texto lineal no muestra.",
    },
    {
      enunciado: "¿Qué significa que un evento ocurrió en el siglo XVI según el calendario gregoriano?",
      opciones: ["Que ocurrió entre los años 1500 y 1600", "Que ocurrió entre los años 1501 y 1600", "Que ocurrió hace exactamente 1600 años", "Que ocurrió entre los años 1600 y 1700"],
      respuestaCorrecta: 1,
      retroalimentacion: "El siglo XVI comprende los años 1501 a 1600 (no 1500-1600, porque no existió el año 0 en el calendario gregoriano). La conquista de México (1519-1521) ocurrió en el siglo XVI.",
    },
    {
      enunciado: "Un historiador analiza simultáneamente lo que ocurría en el Imperio Azteca y en Europa en el año 1500. ¿Qué dimensión del análisis histórico está aplicando?",
      opciones: ["Solo la dimensión temporal", "Solo la dimensión espacial", "La dimensión espacio-temporal combinada: eventos paralelos en distintos lugares", "La dimensión causal: busca quién causó los eventos europeos en América"],
      respuestaCorrecta: 2,
      retroalimentacion:
        "Comparar lo que ocurría simultáneamente en distintos lugares del mundo es la aplicación de la dimensión espacio-temporal combinada. Permite contextualizar eventos locales en un marco global y descubrir conexiones o influencias recíprocas.",
    },
    {
      enunciado: "¿Por qué los mapas históricos son diferentes de los mapas geográficos actuales?",
      opciones: [
        "Porque los mapas históricos son siempre menos precisos debido a la tecnología antigua",
        "Porque muestran cómo eran los territorios, fronteras y paisajes en un momento pasado, que pueden diferir radicalmente del presente",
        "Porque solo muestran batallas y guerras, no geografía",
        "Porque los mapas históricos siempre están dibujados a mano y son decorativos",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Los mapas históricos reflejan la configuración territorial de una época específica. Las fronteras de México han cambiado enormemente desde el Imperio Azteca, la Nueva España y el México independiente. Un mapa del siglo XV muestra el lago de Texcoco y Tenochtitlán donde hoy está la Ciudad de México.",
    },
    {
      enunciado: "La periodización histórica (dividir el pasado en períodos como Antigüedad, Edad Media, Modernidad, etc.) es:",
      opciones: [
        "Una descripción objetiva y neutral de cómo el tiempo se divide naturalmente",
        "Una convención interpretativa que los historiadores construyen; otras culturas pueden tener periodizaciones distintas",
        "Una clasificación biológica de las civilizaciones humanas",
        "Un sistema universal que todas las culturas del mundo reconocen por igual",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "La periodización es una construcción interpretativa, no una división 'natural' del tiempo. La clásica periodización eurocéntrica (Antigüedad-Medievo-Modernidad) no aplica igual para la historia de México o de Asia. Los historiadores debaten constantemente qué eventos marcan el inicio o fin de un período.",
    },
  ],
};

/** CH-I-P01-A6 «Completa los huecos — Coordenadas espacio-temporales» — verbatim. */
export const HUECOS_P01: TextoHuecosData = {
  ancla: "CH-I-P01-A6 · Completa los huecos — Coordenadas espacio-temporales",
  instrucciones: "Lee el párrafo y escribe en cada hueco el concepto histórico que corresponde. Usa los términos del glosario de la progresión.",
  partes: [
    "Para situar un evento histórico se utilizan las ",
    " espacio-temporales, que responden a las preguntas cuándo y dónde ocurrió. La ciencia que establece el orden y la datación de los eventos se llama ",
    ". Los historiadores dividen el tiempo en etapas mediante la ",
    ", que facilita el estudio comparativo de las sociedades. El ",
    " histórico incluye las circunstancias políticas, económicas y sociales que rodearon al evento.",
  ],
  huecos: [
    { respuesta: "coordenadas", alternativas: ["coordenadas espacio-temporales"], pista: "Par de referencias de tiempo y espacio que permiten situar un evento histórico con precisión." },
    { respuesta: "cronología", alternativas: [], pista: "Ciencia auxiliar de la historia que ordena y data los eventos; sirve para construir líneas del tiempo." },
    { respuesta: "periodización", alternativas: [], pista: "División del tiempo histórico en etapas con características comunes: Prehistoria, Edad Antigua, etc." },
    { respuesta: "contexto", alternativas: ["contexto histórico"], pista: "Conjunto de circunstancias que rodean un evento y son indispensables para comprenderlo." },
  ],
};

/** CH-I-P04-A6 «Completa los huecos — Fuentes históricas» — verbatim. */
export const HUECOS_P04: TextoHuecosData = {
  ancla: "CH-I-P04-A6 · Completa los huecos — Fuentes históricas",
  instrucciones: "Lee el párrafo y escribe en cada hueco el concepto histórico que corresponde. Usa los términos del glosario de la progresión.",
  partes: [
    "Una fuente ",
    " es aquella producida en el mismo tiempo y lugar del evento histórico, como un diario, una carta o un artefacto. En contraste, una fuente ",
    " interpreta o sintetiza los documentos originales, como un libro de texto o un artículo académico. La ",
    " histórica es el método para evaluar la autenticidad y veracidad de los documentos. Todo documento tiene un ",
    " que el historiador debe identificar y considerar en su análisis.",
  ],
  huecos: [
    { respuesta: "primaria", alternativas: ["primarias"], pista: "Tipo de fuente producida directamente en la época del evento: cartas, diarios, fotografías originales." },
    { respuesta: "secundaria", alternativas: ["secundarias"], pista: "Tipo de fuente que analiza e interpreta las fuentes directas: libros de historia, enciclopedias, monografías." },
    { respuesta: "crítica", alternativas: ["crítica histórica"], pista: "Método que evalúa la autenticidad (crítica externa) y la veracidad (crítica interna) de los documentos históricos." },
    { respuesta: "sesgo", alternativas: [], pista: "Perspectiva, interés o prejuicio que condiciona la forma en que una fuente presenta los eventos históricos." },
  ],
};
