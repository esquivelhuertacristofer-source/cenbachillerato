/**
 * Datos y lógica pura del laboratorio "Biotecnología y bioética: CRISPR, OGM,
 * clonación" (CNEYT-VI-P08). SIN imports de three / @react-three (límite del
 * Worker de Cloudflare). Reutiliza el módulo puro adn-dogma-data.ts para los
 * colores y el complemento de bases.
 *
 * Todo el texto científico-social (infografía A1, glosario A5, quizzes A2/A4,
 * fill-blanks A6) es VERBATIM del MCCEMS 2025. El mecanismo molecular de CRISPR,
 * el ADN recombinante y la transferencia nuclear se representan de forma
 * ESQUEMÁTICA con biología estándar (PAM NGG, corte de Cas9 3 pb antes del PAM,
 * reparación NHEJ/HDR).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import {
  type Base,
  complementoADN,
  complementoARN,
} from "./adn-dogma-data";

export type Pt = [number, number, number];
export type Modo = "crispr" | "transgenico" | "clonacion";

export interface ModoDef {
  id: Modo;
  etq: string;
  subtitulo: string;
  icono: string;
  color: string;
  fuente: "A1" | "A5";
}
export const MODOS_DEF: Record<Modo, ModoDef> = {
  crispr: {
    id: "crispr",
    etq: "CRISPR-Cas9",
    subtitulo: "El «bisturí molecular»: ARN guía + corte + reparación",
    icono: "fa-scissors",
    color: "#34d399",
    fuente: "A1",
  },
  transgenico: {
    id: "transgenico",
    etq: "Transgénico / OGM",
    subtitulo: "ADN recombinante: insertar un gen en otro organismo",
    icono: "fa-plus",
    color: "#38bdf8",
    fuente: "A1",
  },
  clonacion: {
    id: "clonacion",
    etq: "Clonación",
    subtitulo: "Transferencia nuclear: una copia genéticamente idéntica",
    icono: "fa-clone",
    color: "#a855f7",
    fuente: "A5",
  },
};
export const MODOS: Modo[] = ["crispr", "transgenico", "clonacion"];

/* ════════════════════════════════════════════════════════════════════════
   MODO 1 — CRISPR-Cas9
   Una ARN guía (sgRNA) complementaria localiza la secuencia diana (protospacer)
   junto a un PAM (5'-NGG-3'); la proteína Cas9 realiza un corte de doble cadena
   ~3 pb antes del PAM. La célula repara por NHEJ (deleción → knockout) o HDR
   (inserción precisa con plantilla donadora).  (verbatim glosario A5 / quiz A2)
   ════════════════════════════════════════════════════════════════════════ */

/** Hebra superior 5'→3': protospacer (secuencia diana) de 14 nt. */
export const PROTOSPACER: Base[] = ["G", "A", "C", "A", "C", "C", "T", "G", "A", "G", "G", "A", "G", "A"];
/** Motivo PAM 5'-NGG-3' contiguo al protospacer (obligatorio para Cas9). */
export const PAM: Base[] = ["T", "G", "G"];

/** Hebra superior completa (protospacer + PAM). */
export const HEBRA_TOP: Base[] = [...PROTOSPACER, ...PAM];
/** Hebra inferior (molde), complementaria base a base. */
export const HEBRA_BOT: Base[] = HEBRA_TOP.map(complementoADN);

/** ARN guía (spacer): misma secuencia que el protospacer pero con U en vez de T. */
export const SGRNA: Base[] = PROTOSPACER.map((b) => (b === "T" ? "U" : b));
/** La sgRNA se aparea con la hebra molde; comprobación de complementariedad. */
export const SGRNA_APAREA: Base[] = HEBRA_BOT.slice(0, PROTOSPACER.length).map(complementoARN);

/** Cas9 corta de forma roma 3 pb antes del PAM (entre estos dos índices del protospacer). */
export const CORTE_IDX = PROTOSPACER.length - 3; // corte entre la base 10 y 11 (0-based 10/11)

export type Reparacion = "nhej" | "hdr";
export interface ReparacionDef {
  id: Reparacion;
  etq: string;
  nombre: string;
  icono: string;
  color: string;
  resultado: string;
  uso: string;
  descripcion: string;
}
export const REPARACIONES: ReparacionDef[] = [
  {
    id: "nhej",
    etq: "NHEJ",
    nombre: "Unión de extremos no homólogos",
    icono: "fa-link-slash",
    color: "#fb923c",
    resultado: "Pequeña deleción/inserción (indel) en el sitio de corte → el gen se inactiva.",
    uso: "Knockout: apagar un gen (p. ej. eliminar un gen de susceptibilidad).",
    descripcion:
      "La célula vuelve a pegar los extremos sin molde; suele perder o ganar algunas bases (indel), corriendo el marco de lectura e inactivando el gen.",
  },
  {
    id: "hdr",
    etq: "HDR",
    nombre: "Reparación dirigida por homología",
    icono: "fa-bullseye",
    color: "#34d399",
    resultado: "Inserción/corrección PRECISA usando una plantilla donadora de ADN.",
    uso: "Edición precisa: corregir una mutación o insertar una secuencia deseada.",
    descripcion:
      "Si se aporta una plantilla de ADN con la secuencia deseada, la célula la copia en el corte, reemplazando la secuencia con alta precisión (p. ej. corregir la mutación de la anemia falciforme).",
  },
];
export function reparacionPorId(id: Reparacion): ReparacionDef {
  return REPARACIONES.find((r) => r.id === id) ?? REPARACIONES[0]!;
}

export interface ResultadoCrispr {
  rep: ReparacionDef;
  /** Hebra superior tras la reparación (esquemática). */
  editada: Base[];
  /** Índices afectados (en coords de la hebra editada) para resaltar. */
  marca: number[];
  titulo: string;
}
export function resultadoCrispr(id: Reparacion): ResultadoCrispr {
  const rep = reparacionPorId(id);
  if (id === "nhej") {
    // Indel: deleción de 2 bases en el sitio de corte → frameshift / knockout.
    const editada = [...HEBRA_TOP.slice(0, CORTE_IDX), ...HEBRA_TOP.slice(CORTE_IDX + 2)];
    return {
      rep,
      editada,
      marca: [CORTE_IDX - 1, CORTE_IDX],
      titulo: "Gen inactivado (knockout)",
    };
  }
  // HDR: inserción precisa de un codón donador "CAT" (His) en el sitio de corte.
  const donante: Base[] = ["C", "A", "T"];
  const editada = [...HEBRA_TOP.slice(0, CORTE_IDX), ...donante, ...HEBRA_TOP.slice(CORTE_IDX)];
  return {
    rep,
    editada,
    marca: [CORTE_IDX, CORTE_IDX + 1, CORTE_IDX + 2],
    titulo: "Secuencia corregida (edición precisa)",
  };
}

/** Etapas verbatim del mecanismo (animación). */
export const ETAPAS_CRISPR: { etq: string; detalle: string }[] = [
  { etq: "1 · Reconocimiento", detalle: "La ARN guía (sgRNA) se aparea con la secuencia diana junto al PAM (5'-NGG-3')." },
  { etq: "2 · Corte", detalle: "La proteína Cas9 realiza un corte de doble cadena ~3 pb antes del PAM." },
  { etq: "3 · Reparación", detalle: "La célula repara por NHEJ (indel → knockout) o HDR (inserción precisa con plantilla)." },
];

/* ════════════════════════════════════════════════════════════════════════
   MODO 2 — Transgénico / OGM  (ADN recombinante)
   Se corta un plásmido con una enzima de restricción, se inserta el gen foráneo
   con ADN ligasa y se transforma un hospedero que produce la proteína deseada.
   Casos VERBATIM de la infografía A1 / glosario A5 / V-F A4.
   ════════════════════════════════════════════════════════════════════════ */

export interface TransgenDef {
  id: string;
  etq: string;
  gen: string;
  hospedero: string;
  producto: string;
  anio: string;
  icono: string;
  color: string;
  descripcion: string;
  ejemplo: string;
}
export const TRANSGENES: TransgenDef[] = [
  {
    id: "insulina",
    etq: "Insulina humana",
    gen: "Gen humano de la insulina",
    hospedero: "E. coli (plásmido bacteriano)",
    producto: "Insulina humana",
    anio: "1982",
    icono: "fa-syringe",
    color: "#38bdf8",
    descripcion:
      "El gen humano de la insulina se inserta en un plásmido y se introduce en la bacteria E. coli, que la produce a gran escala.",
    ejemplo:
      "La insulina humana producida por E. coli transgénica es usada por millones de diabéticos desde 1982, sustituyendo a la insulina animal.",
  },
  {
    id: "maizbt",
    etq: "Maíz Bt",
    gen: "Gen de Bacillus thuringiensis",
    hospedero: "Maíz (Zea mays)",
    producto: "Toxina Bt (insecticida propio)",
    anio: "1996",
    icono: "fa-seedling",
    color: "#34d399",
    descripcion:
      "El maíz Bt lleva un gen de la bacteria Bacillus thuringiensis que le permite producir una toxina contra los insectos plaga.",
    ejemplo:
      "Maíz Bt: gen de Bacillus thuringiensis que produce una toxina contra insectos. En México su cultivo es polémico por ser centro de origen del maíz.",
  },
  {
    id: "arrozdorado",
    etq: "Arroz dorado",
    gen: "Genes de síntesis de betacaroteno",
    hospedero: "Arroz (Oryza sativa)",
    producto: "Betacaroteno (provitamina A)",
    anio: "2000",
    icono: "fa-bowl-rice",
    color: "#fbbf24",
    descripcion:
      "El arroz dorado incorpora genes para sintetizar betacaroteno (provitamina A) y combatir su deficiencia en la dieta.",
    ejemplo: "Arroz dorado: genes de síntesis de betacaroteno para combatir la deficiencia de vitamina A.",
  },
];
export function transgenPorId(id: string): TransgenDef {
  return TRANSGENES.find((t) => t.id === id) ?? TRANSGENES[0]!;
}

/** Sitio de restricción EcoRI (palindrómico) reconocido por la enzima. */
export const SITIO_RESTRICCION: Base[] = ["G", "A", "A", "T", "T", "C"];
export const ETAPAS_TRANSGEN: { etq: string; detalle: string }[] = [
  { etq: "1 · Aislar el gen", detalle: "Se identifica y aísla el gen de interés del organismo donante." },
  { etq: "2 · Cortar", detalle: "Una enzima de restricción corta el plásmido y el gen dejando extremos compatibles." },
  { etq: "3 · Ligar", detalle: "La ADN ligasa une el gen al plásmido → plásmido recombinante." },
  { etq: "4 · Transformar", detalle: "El plásmido entra en el hospedero, que ahora expresa la proteína." },
];

/* ════════════════════════════════════════════════════════════════════════
   MODO 3 — Clonación  (transferencia nuclear de células somáticas, SCNT)
   Caso Dolly (1996). Distinción reproductiva (organismo completo) vs
   terapéutica (células madre, sin fin reproductivo).  (verbatim glosario A5 / A2)
   ════════════════════════════════════════════════════════════════════════ */

export type TipoClon = "reproductiva" | "terapeutica";
export interface ClonDef {
  id: TipoClon;
  etq: string;
  icono: string;
  color: string;
  objetivo: string;
  resultado: string;
  descripcion: string;
  ejemplo: string;
}
export const CLONES: ClonDef[] = [
  {
    id: "reproductiva",
    etq: "Reproductiva",
    icono: "fa-paw",
    color: "#a855f7",
    objetivo: "Generar un organismo completo genéticamente idéntico al donante del núcleo.",
    resultado: "Un individuo clon (mismo genoma que el donante).",
    descripcion:
      "El embrión reconstruido se implanta en una madre sustituta y se desarrolla hasta nacer un organismo idéntico al donante del núcleo.",
    ejemplo:
      "La oveja Dolly (1996, Instituto Roslin) fue el primer mamífero clonado a partir de una célula adulta diferenciada, por transferencia nuclear.",
  },
  {
    id: "terapeutica",
    etq: "Terapéutica",
    icono: "fa-staff-snake",
    color: "#34d399",
    objetivo: "Obtener células madre compatibles con un paciente, sin fin reproductivo.",
    resultado: "Células madre embrionarias para medicina regenerativa.",
    descripcion:
      "El embrión clonado no se implanta: se usa solo para obtener células madre compatibles con el paciente para tratar enfermedades.",
    ejemplo:
      "La clonación terapéutica produce células madre embrionarias para medicina regenerativa, sin propósito reproductivo.",
  },
];
export function clonPorId(id: TipoClon): ClonDef {
  return CLONES.find((c) => c.id === id) ?? CLONES[0]!;
}
export const ETAPAS_CLONACION: { etq: string; detalle: string }[] = [
  { etq: "1 · Donante", detalle: "Se toma el núcleo (con el genoma completo) de una célula somática adulta del donante." },
  { etq: "2 · Enuclear", detalle: "Se extrae el núcleo de un óvulo, dejándolo sin material genético." },
  { etq: "3 · Transferir y fusionar", detalle: "El núcleo somático se inserta en el óvulo enucleado y un pulso eléctrico los fusiona." },
  { etq: "4 · Desarrollo", detalle: "El embrión reconstruido se divide; según el fin será reproductivo o terapéutico." },
];

/* ════════════════════════════════════════════════════════════════════════
   CONTENIDO VERBATIM (infografía A1, glosario A5, quizzes A2/A4, fill-blanks A6)
   ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 =
  "Biotecnología y bioética en México: CRISPR, maíz transgénico y el debate de la edición genómica";

export const DEFINICION =
  "La biotecnología moderna usa organismos vivos, sistemas biológicos o derivados para desarrollar productos o procesos: ingeniería genética, cultivo de tejidos, fermentación industrial, diagnóstico molecular y edición genómica.";

/** Puntos clave verbatim de la infografía A1. */
export const PUNTOS_CLAVE: string[] = [
  "La biotecnología moderna usa organismos vivos, sistemas biológicos o derivados para desarrollar productos o procesos: ingeniería genética, cultivo de tejidos, fermentación industrial, diagnóstico molecular y edición genómica.",
  "CRISPR-Cas9: sistema de edición genómica de precisión, análogo a un «bisturí molecular». Permite modificar secuencias específicas del ADN con mayor precisión y menor costo que técnicas anteriores. Las investigadoras Jennifer Doudna y Emmanuelle Charpentier recibieron el Nobel de Química 2020 por su desarrollo.",
  "Luis Herrera-Estrella (LANGEBIO-CINVESTAV Irapuato) fue el primer científico en desarrollar plantas transgénicas funcionales en 1983 —introdujo el primer gen foráneo funcional en una planta. Premio Fronteras del Conocimiento 2021. México es pionero científico y, simultáneamente, el país con más debates sobre transgénicos.",
  "El debate del maíz transgénico en México: en 2020 el gobierno emitió un decreto para eliminar gradualmente el maíz GM para consumo humano directo. En 2023, un tribunal federal falló contra el decreto argumentando que violaba compromisos del T-MEC con EE.UU. México es el único país del mundo donde el maíz tiene estatus especial por ser su centro de origen.",
  "OGM en México: la soya transgénica (resistente al herbicida glifosato) se cultiva en ~250,000 ha en Yucatán y Campeche, con controversia por impactos en los apicultores mayas y la biodiversidad de la Selva Yucateca.",
  "CIBIOGEM (Comisión Intersecretarial de Bioseguridad de los OGM): organismo interministerial que emite permisos de liberación experimental, piloto y comercial de OGM en México.",
  "CONBIOÉTICA (Comisión Nacional de Bioética): dependiente de la Secretaría de Salud, emite guías sobre investigación con células madre, edición genómica de embriones humanos, uso de IA en medicina y ensayos clínicos en poblaciones vulnerables.",
  "LANGEBIO-CINVESTAV aplica CRISPR para mejorar variedades de maíz nativo resistentes a plagas sin transgénesis convencional. El Instituto de Biotecnología de la UNAM en Cuernavaca aplica CRISPR en diagnóstico de tuberculosis, dengue y leishmaniasis.",
];

/** Línea de tiempo verbatim (descripción accesible de la infografía A1). */
export interface Hito {
  anio: string;
  texto: string;
}
export const HITOS: Hito[] = [
  { anio: "1983", texto: "Primer transgénico vegetal por Herrera-Estrella" },
  { anio: "1996", texto: "Primer cultivo OGM comercial en México" },
  { anio: "2009", texto: "Creación de CIBIOGEM" },
  { anio: "2020", texto: "Decreto anti-maíz GM" },
  { anio: "2023", texto: "Fallo judicial en contra del decreto" },
];

/** Los principios de la bioética (definiciones verbatim del glosario A1 «Bioética»;
 *  la infografía A1 añade «dignidad humana» como quinto principio). */
export interface PrincipioBioetica {
  nombre: string;
  definicion: string;
  desdeInfografia?: boolean;
}
export const PRINCIPIOS_BIOETICA: PrincipioBioetica[] = [
  { nombre: "Autonomía", definicion: "Respetar la decisión del individuo." },
  { nombre: "Beneficencia", definicion: "Hacer el bien." },
  { nombre: "No maleficencia", definicion: "No hacer daño." },
  { nombre: "Justicia", definicion: "Distribuir equitativamente beneficios y riesgos." },
  { nombre: "Dignidad humana", definicion: "Quinto principio enunciado en la infografía A1.", desdeInfografia: true },
];

/** Casos críticos de bioética (verbatim de la infografía A1). */
export interface CasoCritico {
  titulo: string;
  texto: string;
  icono: string;
}
export const CASOS_CRITICOS: CasoCritico[] = [
  {
    titulo: "Vaquita marina",
    icono: "fa-fish",
    texto:
      "La vaquita marina (Phocoena sinus), con menos de 10 individuos en 2024, es el mamífero marino más amenazado del mundo. La CIBIOGEM ha respaldado propuestas de conservación mediante biotecnología reproductiva (criopreservación de material genético), pero no existe ningún individuo en cautiverio.",
  },
  {
    titulo: "Maíz transgénico y soberanía",
    icono: "fa-wheat-awn",
    texto:
      "México es el único país del mundo donde el maíz tiene estatus especial por ser su centro de origen. El debate enfrenta la soberanía alimentaria y la biodiversidad nativa con la adopción de OGM y los compromisos del T-MEC.",
  },
  {
    titulo: "Edición de embriones (He Jiankui)",
    icono: "fa-baby",
    texto:
      "He Jiankui, el científico chino que en 2018 editó embriones humanos con CRISPR para hacerlos resistentes al VIH, fue condenado a tres años de prisión. El caso generó condena científica y ética internacional.",
  },
];

export const GERMINAL_VS_SOMATICA =
  "Edición somática: modifica células del cuerpo del individuo; los cambios NO son heredables. Edición de la línea germinal: modifica embriones, óvulos o espermatozoides; los cambios SE HEREDAN indefinidamente y generan las mayores preocupaciones éticas (consentimiento de generaciones futuras, eugenesia).";

export interface GlosarioItem {
  termino: string;
  definicion: string;
  ejemplo: string;
}
/** Glosario verbatim A5. */
export const GLOSARIO: GlosarioItem[] = [
  {
    termino: "OGM / transgénicos",
    definicion:
      "Organismos a los que se les ha transferido material genético exógeno mediante técnicas de ADN recombinante (plásmidos, vectores virales, biobalística).",
    ejemplo:
      "La insulina humana producida por E. coli transgénica es usada por millones de diabéticos desde 1982, sustituyendo a la insulina animal.",
  },
  {
    termino: "CRISPR-Cas9",
    definicion:
      "Sistema de edición génica derivado de un mecanismo inmune bacteriano. Un ARN guía (sgRNA) lleva a la proteína Cas9 a una secuencia específica del genoma donde hace un corte de doble cadena. La célula lo repara por NHEJ (deleción/mutación) o HDR (inserción precisa).",
    ejemplo:
      "CRISPR se ha usado para tratar la anemia de células falciformes (edición de células madre hematopoyéticas) y crear cultivos resistentes a enfermedades.",
  },
  {
    termino: "Clonación",
    definicion:
      "Proceso que produce copias genéticamente idénticas. Reproductiva: produce un organismo con el mismo genoma que el donante. Terapéutica: produce células madre embrionarias para medicina regenerativa, sin propósito reproductivo.",
    ejemplo:
      "La oveja Dolly fue clonada en 1996 transfiriendo el núcleo de una célula mamaria ovina a un óvulo enucleado.",
  },
  {
    termino: "Principios de bioética",
    definicion:
      "Beneficencia (buscar el mayor beneficio), no maleficencia (evitar daños), justicia (acceso equitativo) y autonomía (consentimiento informado). En biotecnología también: precaución, transparencia y soberanía alimentaria.",
    ejemplo:
      "El debate sobre los transgénicos involucra beneficencia, justicia (¿quién controla las semillas?) y precaución (riesgos ambientales a largo plazo).",
  },
  {
    termino: "Edición germinal vs somática",
    definicion:
      "Somática: modifica células del cuerpo; no heredable. Germinal: modifica embriones/gametos; los cambios se heredan indefinidamente.",
    ejemplo:
      "El tratamiento Casgevy (2023) usa CRISPR en células madre hematopoyéticas de adultos con anemia falciforme: edición somática, no heredable.",
  },
  {
    termino: "Bioprospección y propiedad intelectual",
    definicion:
      "Búsqueda de organismos útiles para biotecnología. Genera debates sobre propiedad de los recursos genéticos, biopiratería y el Protocolo de Nagoya (acceso y beneficios compartidos).",
    ejemplo:
      "Patentar variedades derivadas del maíz azul mexicano sin compensar a las comunidades originarias es un caso de biopiratería.",
  },
];

/** Hechos verbatim (retroalimentación de los quizzes A2/A4). */
export const HECHOS: string[] = [
  "CRISPR-Cas9 usa una ARN guía complementaria al sitio diana del ADN; la Cas9 corta con precisión y la célula lo repara con o sin la secuencia deseada.",
  "Los transgénicos se producen mediante técnicas de ADN recombinante: maíz Bt (gen de Bacillus thuringiensis), arroz dorado (betacaroteno) e insulina humana (E. coli transgénica).",
  "La clonación reproductiva humana está prohibida o fuertemente regulada en casi todos los países por objeciones éticas y por su baja eficiencia y alto riesgo.",
  "El flujo génico de transgénicos hacia variedades silvestres emparentadas es una preocupación ambiental real, crítica en México por ser centro de origen del maíz.",
  "Editar la línea germinal (heredable) NO es éticamente equivalente a editar células somáticas (no heredable): la germinal cambia el genoma de la especie.",
];

export interface DatoCard {
  valor: string;
  texto: string;
  icono: string;
}
export const DATOS: DatoCard[] = [
  { valor: "1983", texto: "Primer transgénico vegetal, por Herrera-Estrella en México", icono: "fa-seedling" },
  { valor: "Nobel 2020", texto: "Química — Doudna y Charpentier por CRISPR", icono: "fa-award" },
  { valor: "<10", texto: "Vaquitas marinas vivas en 2024; ninguna en cautiverio", icono: "fa-fish" },
  { valor: "1996", texto: "La oveja Dolly: primer mamífero clonado de célula adulta", icono: "fa-clone" },
];

/** Preguntas de reflexión verbatim (infografía A1). */
export const PREGUNTAS: string[] = [
  "México es el centro de origen del maíz y uno de los primeros países en desarrollar plantas transgénicas. ¿Crees que esto crea una responsabilidad especial hacia la diversidad genética del maíz nativo?",
  "CRISPR permite editar genes en embriones humanos para eliminar enfermedades hereditarias. ¿Dónde trazarías la línea entre uso terapéutico (eliminar enfermedad) y eugenesia (seleccionar características deseadas)? ¿Quién debería decidir?",
  "¿Por qué la edición genómica con CRISPR sin inserción de ADN externo está en una «zona gris» regulatoria? ¿Debería regularse igual que un OGM tradicional o de forma diferente?",
];

export const CONTEXTO =
  "México ocupa una posición única y paradójica en la biotecnología global: fue pionero en plantas transgénicas gracias a Luis Herrera-Estrella, pero al mismo tiempo es el centro de origen del maíz y mantiene una postura cautelosa sobre los OGM para consumo humano. El LANGEBIO en Irapuato usa CRISPR para activar o silenciar genes ya existentes en el maíz nativo —sin insertar ADN foráneo—, lo que crea una «zona gris» regulatoria.";

export const FUENTE =
  "LANGEBIO CINVESTAV Irapuato — Edición Genómica en Maíces Mexicanos 2023; CONBIOÉTICA — Marco ético para la biotecnología 2022; CIBIOGEM — Informe anual de OGM en México 2022. Contenido verbatim del MCCEMS 2025 (infografía A1, glosario A5, quizzes A2/A4).";

/* ════════════════════════════════════════════════════════════════════════
   QUIZ EVALUABLE — VERBATIM de CNEYT-VI-P08-A2 (quiz_multiple_opcion
   «Quiz: Bioética y biotecnología»). Se usa en la tarjeta evaluable del lab
   (parte B del tratamiento): el alumno responde el quiz real dentro del lab.
   ════════════════════════════════════════════════════════════════════════ */
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Bioética y biotecnología",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Cuál es el mecanismo de acción de CRISPR-Cas9?",
      opciones: [
        "Inserta genes al azar en el genoma usando virus",
        "Una ARN guía dirige la proteína Cas9 al sitio exacto del ADN para cortarlo",
        "Produce copias de ARNm para aumentar la expresión génica",
        "Elimina cromosomas completos de la célula",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "CRISPR-Cas9 usa una ARN guía complementaria al sitio diana del ADN. La Cas9 corta el ADN con precisión y la célula puede repararlo con o sin la secuencia deseada.",
    },
    {
      enunciado: "¿Por qué el maíz transgénico es tema de debate especial en México?",
      opciones: [
        "Porque México no produce maíz nativo",
        "Porque México es centro de origen y diversificación del maíz, y hay riesgo de contaminación del germoplasma nativo",
        "Porque el maíz OGM es ilegal en todo el mundo",
        "Porque el maíz Bt produce toxinas peligrosas para humanos",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "México es el centro de origen del maíz y alberga cientos de variedades nativas. La contaminación por flujo génico de variedades transgénicas amenaza esa biodiversidad y la soberanía alimentaria.",
    },
    {
      enunciado:
        "¿Cuál principio bioético obliga al médico a respetar la decision informada del paciente sobre su tratamiento?",
      opciones: ["No maleficencia", "Beneficencia", "Autonomia", "Justicia"],
      respuestaCorrecta: 2,
      retroalimentacion:
        "El principio de autonomia establece que el paciente tiene derecho a tomar decisiones informadas sobre su propio cuerpo y tratamiento. El consentimiento informado es su expresion concreta.",
    },
    {
      enunciado: "¿Cuál es la diferencia entre clonacion reproductiva y clonacion terapéutica?",
      opciones: [
        "La reproductiva usa CRISPR y la terapéutica no",
        "La reproductiva busca crear un individuo completo; la terapéutica busca obtener células madre para tratar enfermedades",
        "La terapéutica esta prohibida en todos los paises",
        "No hay diferencia; son el mismo proceso",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "La clonacion reproductiva persigue generar un organismo completo geneticamente identico (como Dolly). La terapéutica usa embriones clonados solo para obtener células madre compatibles con un paciente, sin fines reproductivos.",
    },
    {
      enunciado: "¿Qué organismo regula en México el uso y liberacion de OGM al ambiente?",
      opciones: ["IMSS", "CIBIOGEM", "UNAM", "PEMEX"],
      respuestaCorrecta: 1,
      retroalimentacion:
        "La CIBIOGEM (Comision Intersecretarial de Bioseguridad de los Organismos Geneticamente Modificados) es el organismo gubernamental mexicano que aplica el principio de precaucion y regula los OGM.",
    },
  ],
};
