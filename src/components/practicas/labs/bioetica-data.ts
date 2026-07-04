/**
 * Datos del Laboratorio — Bioética: cuando la ciencia y la moral se encuentran
 * (PFH-II-P03, Pensamiento Filosófico e Histórico II).
 *
 * Contenido VERBATIM de PFH-II·P03. Las definiciones de los cuatro principios,
 * los dilemas, el caso Tuskegee y la distinción legal/ético se toman literalmente
 * de A1 (lectura). El glosario es A5 verbatim. El cuestionario combina A4 (V/F)
 * y A2 (V/F) verbatim. Los casos a clasificar son situaciones que la propia
 * lectura A1 asocia explícitamente a un principio; cuando un caso es ilustrativo
 * añadido por contexto del aula se marca claramente con «ilustrativo».
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿Qué principio bioético está en juego?
 * Clasifica cada caso según el principio fundamental de Beauchamp y Childress
 * (1979) que la lectura A1 pone en primer plano. Se usan SOLO los cuatro
 * principios que A1 nombra: autonomía, beneficencia, no maleficencia y justicia.
 * ───────────────────────────────────────────────────────────────────────── */
export type Principio = "autonomia" | "beneficencia" | "noMaleficencia" | "justicia";

export const PRINCIPIO_INFO: Record<
  Principio,
  { titulo: string; subtitulo: string; icono: string }
> = {
  autonomia: {
    titulo: "Autonomía",
    subtitulo: "Reconoce el derecho de las personas a tomar decisiones informadas sobre su propia salud y cuerpo, sin coacción.",
    icono: "fa-hand-pointer",
  },
  beneficencia: {
    titulo: "Beneficencia",
    subtitulo: "Exige que los profesionales de la salud actúen siempre en beneficio del paciente.",
    icono: "fa-hand-holding-heart",
  },
  noMaleficencia: {
    titulo: "No maleficencia",
    subtitulo: "«Primero no dañar»: ninguna intervención médica debe causar más daño que beneficio.",
    icono: "fa-shield-halved",
  },
  justicia: {
    titulo: "Justicia",
    subtitulo: "Exige que los recursos y tratamientos médicos se distribuyan de manera equitativa.",
    icono: "fa-scale-balanced",
  },
};

export const CASOS: { id: string; texto: string; principio: Principio }[] = [
  {
    id: "ca-aborto",
    texto: "El debate sobre el aborto en México pone en juego el derecho de las mujeres a decidir sobre su propio cuerpo.",
    principio: "autonomia",
  },
  {
    id: "ca-consent",
    texto: "Un paciente, debidamente informado, decide sin coacción rechazar un tratamiento que le proponen.",
    principio: "autonomia",
  },
  {
    id: "ca-benef",
    texto: "Un médico elige la terapia que más conviene a la salud de su paciente, actuando siempre en su beneficio.",
    principio: "beneficencia",
  },
  {
    id: "ca-crispr",
    texto: "Usar CRISPR-Cas9 para eliminar una enfermedad hereditaria busca obtener un beneficio para el paciente.",
    principio: "beneficencia",
  },
  {
    id: "ca-tuskegee",
    texto: "En el Caso Tuskegee se observó el progreso de la sífilis en pacientes sin darles tratamiento, causándoles un daño evitable.",
    principio: "noMaleficencia",
  },
  {
    id: "ca-primum",
    texto: "Ante una intervención arriesgada, el equipo médico se detiene porque causaría más daño que beneficio al paciente.",
    principio: "noMaleficencia",
  },
  {
    id: "ca-justa",
    texto: "Garantizar que los recursos y tratamientos médicos lleguen de forma equitativa a toda la población.",
    principio: "justicia",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Empareja concepto y definición (A1 verbatim).
 * Cada principio o dilema con su definición tal como aparece en la lectura.
 * ───────────────────────────────────────────────────────────────────────── */
export const CONCEPTOS: { id: string; concepto: string; definicion: string; ejemplo: string }[] = [
  {
    id: "co-bioetica",
    concepto: "Bioética",
    definicion: "Disciplina que estudia las implicaciones morales de los avances en biología y medicina.",
    ejemplo: "El término fue acuñado por el oncólogo Van Rensselaer Potter en 1971, como un puente entre las ciencias de la vida y los valores humanos.",
  },
  {
    id: "co-autonomia",
    concepto: "Principio de autonomía",
    definicion: "Reconoce el derecho de las personas a tomar decisiones informadas sobre su propia salud y cuerpo, sin coacción.",
    ejemplo: "Una persona, informada, consiente o rechaza libremente un tratamiento.",
  },
  {
    id: "co-beneficencia",
    concepto: "Principio de beneficencia",
    definicion: "Exige que los profesionales de la salud actúen siempre en beneficio del paciente.",
    ejemplo: "El médico elige la opción terapéutica que mejor sirve al bienestar de quien atiende.",
  },
  {
    id: "co-nomaleficencia",
    concepto: "Principio de no maleficencia",
    definicion: "«Primero no dañar»: establece que ninguna intervención médica debe causar más daño que beneficio.",
    ejemplo: "Se evita un procedimiento cuyos perjuicios superarían a sus posibles beneficios.",
  },
  {
    id: "co-justicia",
    concepto: "Principio de justicia",
    definicion: "Exige que los recursos y tratamientos médicos se distribuyan de manera equitativa.",
    ejemplo: "Que el acceso a la salud no dependa del nivel económico de cada persona.",
  },
  {
    id: "co-eutanasia",
    concepto: "Eutanasia",
    definicion: "Acción u omisión que provoca la muerte de un paciente con enfermedad terminal para aliviar su sufrimiento.",
    ejemplo: "No está legalizada en México, aunque el debate legislativo continúa.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim).
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-bioetica",
    termino: "Bioética",
    definicion: "Reflexión ética sobre los problemas derivados de la vida, la salud y la biotecnología.",
    ejemplo: "Debatir los límites de la manipulación genética.",
  },
  {
    id: "gl-ia",
    termino: "Inteligencia artificial",
    definicion: "Tecnología que simula procesos del pensamiento humano y plantea debates sobre el Ser.",
    ejemplo: "Preguntar si una máquina puede «decidir» o «comprender».",
  },
  {
    id: "gl-postura",
    termino: "Postura ética",
    definicion: "Posición razonada sobre lo correcto frente a un problema, como el ambiental.",
    ejemplo: "Asumir el cuidado del planeta como un deber.",
  },
  {
    id: "gl-animalidad",
    termino: "Filosofía de la animalidad",
    definicion: "Reflexión sobre el estatus moral de los animales y nuestra relación con ellos.",
    ejemplo: "Preguntar si los animales tienen derechos.",
  },
  {
    id: "gl-ambiental",
    termino: "Problema medioambiental",
    definicion: "Daño al entorno que plantea responsabilidades éticas hacia la vida y el futuro.",
    ejemplo: "El cambio climático y la contaminación.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión — V/F verbatim de A4 (1-4) y A2 (5-8).
 * Renderizado como opción doble Verdadero / Falso (0 = Verdadero, 1 = Falso).
 * ───────────────────────────────────────────────────────────────────────── */
export const QUIZ: {
  pregunta: string;
  opciones: [string, string];
  correcta: 0 | 1;
  retro: string;
}[] = [
  {
    pregunta: "La Bioética reflexiona sobre los problemas éticos que surgen de la vida, la salud y la biotecnología.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: la Bioética piensa las implicaciones éticas de intervenir la vida.",
  },
  {
    pregunta: "La inteligencia artificial abre debates filosóficos sobre la naturaleza del Ser y de la conciencia.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: la IA replantea qué entendemos por pensar, decidir y ser.",
  },
  {
    pregunta: "El avance científico y tecnológico no requiere ninguna reflexión ética.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Todo avance implica decisiones con consecuencias que la Ética debe valorar.",
  },
  {
    pregunta: "Los problemas medioambientales pueden abordarse desde una postura ética.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: la crisis ambiental plantea deberes hacia el planeta y las generaciones futuras.",
  },
  {
    pregunta: "La bioética es solo una rama de la medicina clínica, no de la filosofía.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "La bioética es una disciplina filosófica interdisciplinar que incluye ética, derecho, medicina y ciencias sociales.",
  },
  {
    pregunta: "La autonomía de la persona es uno de los principios fundamentales de la bioética moderna.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. La bioética principialista (Beauchamp y Childress) incluye autonomía, beneficencia, no maleficencia y justicia.",
  },
  {
    pregunta: "El debate sobre la eutanasia implica únicamente consideraciones médicas, no filosóficas ni jurídicas.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "La eutanasia involucra dilemas filosóficos (autonomía, muerte digna), éticos, religiosos y jurídicos profundos.",
  },
  {
    pregunta: "La perspectiva de género en la bioética señala que las mujeres históricamente han tenido menos control sobre las decisiones sobre su propio cuerpo.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. La bioética feminista señala cómo el patriarcado ha controlado los cuerpos de las mujeres en medicina, reproducción y salud.",
  },
  {
    pregunta: "La ingeniería genética no plantea dilemas éticos relevantes porque es solo tecnología.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "La ingeniería genética plantea preguntas filosóficas serias: ¿quién decide qué genes son «mejores»?, ¿hay riesgo de eugenesia?, ¿qué es una vida «normal»?",
  },
  {
    pregunta: "La ética ambiental puede considerarse parte de la bioética cuando analiza los derechos de los seres vivos no humanos.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. La bioética extendida incluye las relaciones éticas con el ambiente, animales y ecosistemas.",
  },
];

/** Dato verbatim de A1: la diferencia entre lo legal y lo ético. */
export const DATO_BIOETICA =
  "Algo puede ser legal sin ser ético, y algo puede ser éticamente cuestionable sin ser ilegal. El Caso Tuskegee (1932-1972), donde se observó el progreso de la sífilis sin dar tratamiento a los pacientes, era legal pero profundamente antiético.";
