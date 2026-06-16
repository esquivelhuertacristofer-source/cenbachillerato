/**
 * Datos y matemática pura del laboratorio "Mutaciones: tipos, causas y
 * consecuencias" (CNEYT-VI-P06). SIN imports de three / @react-three (límite del
 * Worker de Cloudflare). Toda la biología (texto, glosario, ejemplos) es VERBATIM
 * del MCCEMS 2025 (lectura A1, glosario A5, quizzes A2/A4, fill-blanks A6). El
 * código genético se reutiliza del lab del dogma central (referencia universal).
 */

import {
  type CodonInfo,
  transcribir,
  traducir,
} from "./adn-dogma-data";
import type { QuizEvaluable } from "./_reto-quiz";

export type Pt = [number, number, number];
export type Modo = "puntuales" | "cromosomicas" | "mutagenos";

export interface ModoDef {
  id: Modo;
  etq: string;
  subtitulo: string;
  icono: string;
  color: string;
  fuente: "A1" | "A5" | "A4" | "A6";
}
export const MODOS_DEF: Record<Modo, ModoDef> = {
  puntuales: {
    id: "puntuales",
    etq: "Mutaciones puntuales",
    subtitulo: "Sustitución · inserción · deleción → efecto en la proteína",
    icono: "fa-dna",
    color: "#34d399",
    fuente: "A1",
  },
  cromosomicas: {
    id: "cromosomicas",
    etq: "Mutaciones cromosómicas",
    subtitulo: "Deleción · duplicación · inversión · translocación · aneuploidía",
    icono: "fa-grip-lines-vertical",
    color: "#a855f7",
    fuente: "A5",
  },
  mutagenos: {
    id: "mutagenos",
    etq: "Mutágenos y daño al ADN",
    subtitulo: "Físicos · químicos · biológicos → dímero de timina",
    icono: "fa-radiation",
    color: "#fb923c",
    fuente: "A1",
  },
};
export const MODOS: Modo[] = ["puntuales", "cromosomicas", "mutagenos"];

/* ════════════════════════════════════════════════════════════════════════
 * 1 · MUTACIONES PUNTUALES (génicas)
 * ════════════════════════════════════════════════════════════════════════ */

/** Cadena codificante (sentido 5'→3') de trabajo. Las 6 primeras tripletas
 *  coinciden con el inicio real del gen de la β-globina humana (HBB): el codón
 *  GAG (Glu) es donde ocurre la mutación de la anemia falciforme (A5). */
export const BASE_CODIFICANTE = "ATGGTGCACCTGACTCCTGAGGAG";

export type ClasePuntual = "ninguna" | "silenciosa" | "missense" | "nonsense" | "frameshift";

export interface OpMutacion {
  op: "sub" | "ins" | "del";
  pos: number; // índice 0-based en la cadena codificante
  base?: string; // nueva base para sub / ins
}

export interface MutPuntualDef {
  id: ClasePuntual;
  etq: string;
  tipoTec: string; // término técnico
  icono: string;
  color: string;
  spec: OpMutacion | null;
  descripcion: string;
}

/** Las cinco situaciones que el estudiante compara, todas sobre BASE_CODIFICANTE.
 *  Codones (ADN): ATG·GTG·CAC·CTG·ACT·CCT·GAG·GAG
 *  ARNm:          AUG·GUG·CAC·CUG·ACU·CCU·GAG·GAG  (Met-Val-His-Leu-Thr-Pro-Glu-Glu) */
export const MUTACIONES_PUNTUALES: MutPuntualDef[] = [
  {
    id: "ninguna",
    etq: "Secuencia original",
    tipoTec: "Sin mutación",
    icono: "fa-circle-check",
    color: "#38bdf8",
    spec: null,
    descripcion:
      "Gen sano (β-globina, HbA). El ARNm se traduce sin alteraciones: Met-Val-His-Leu-Thr-Pro-Glu-Glu.",
  },
  {
    id: "silenciosa",
    etq: "Silenciosa (sinónima)",
    tipoTec: "Sustitución sinónima",
    icono: "fa-volume-xmark",
    color: "#94a3b8",
    spec: { op: "sub", pos: 23, base: "A" }, // GAG → GAA (ambos Glu)
    descripcion:
      "Sustitución de una base que NO cambia el aminoácido (GAG→GAA, ambos = Glu). El código genético es degenerado: varios codones codifican el mismo aminoácido, así que la proteína no se altera.",
  },
  {
    id: "missense",
    etq: "Sentido erróneo (missense)",
    tipoTec: "Sustitución no sinónima",
    icono: "fa-droplet",
    color: "#f87171",
    spec: { op: "sub", pos: 19, base: "T" }, // GAG → GTG (Glu → Val)
    descripcion:
      "Anemia de células falciformes: la sustitución A→T en el codón de la β-globina convierte GAG (ácido glutámico) en GTG (valina). Un solo aminoácido cambiado altera la hemoglobina (HbS), que se polimeriza en hipoxia.",
  },
  {
    id: "nonsense",
    etq: "Sin sentido (nonsense)",
    tipoTec: "Sustitución a codón de parada",
    icono: "fa-ban",
    color: "#fb923c",
    spec: { op: "sub", pos: 18, base: "T" }, // GAG → TAG (codón de paro prematuro)
    descripcion:
      "La sustitución crea un codón de parada prematuro (GAG→TAG = UAG). La traducción se detiene antes de tiempo y se produce una proteína truncada, casi siempre no funcional.",
  },
  {
    id: "frameshift",
    etq: "Desplazamiento del marco",
    tipoTec: "Deleción de 1 nucleótido (frameshift)",
    icono: "fa-arrows-left-right-to-line",
    color: "#fbbf24",
    spec: { op: "del", pos: 6 }, // elimina la C del codón 3 → corre todo el marco
    descripcion:
      "Deleción de un nucleótido (no múltiplo de 3): desplaza el marco de lectura. Todos los codones siguientes cambian (frameshift) y suele aparecer un codón de parada prematuro, arruinando la proteína.",
  },
];
export function mutPuntualPorId(id: ClasePuntual): MutPuntualDef {
  return MUTACIONES_PUNTUALES.find((m) => m.id === id) ?? MUTACIONES_PUNTUALES[0]!;
}

/** Aplica una operación de mutación a una cadena codificante. */
export function aplicarMutacion(cod: string, spec: OpMutacion | null): string {
  if (!spec) return cod;
  const a = cod.split("");
  if (spec.op === "sub") {
    if (spec.pos >= 0 && spec.pos < a.length) a[spec.pos] = spec.base ?? a[spec.pos]!;
    return a.join("");
  }
  if (spec.op === "del") {
    a.splice(spec.pos, 1);
    return a.join("");
  }
  // ins
  a.splice(spec.pos, 0, spec.base ?? "A");
  return a.join("");
}

/** Traduce una cadena codificante de ADN a su péptido (ARNm → proteína). */
export function aminoacidosDe(codificante: string): CodonInfo[] {
  return traducir(transcribir(codificante));
}

export interface AnalisisPuntual {
  def: MutPuntualDef;
  codMutada: string;
  arnmOriginal: string;
  arnmMutado: string;
  protOriginal: CodonInfo[];
  protMutada: CodonInfo[];
  /** índice del primer aminoácido que difiere (incluye truncamientos); -1 si idénticas */
  cambioIdx: number;
  /** efecto resumido para el lector */
  efecto: string;
}

/** Analiza una mutación puntual contra la secuencia base. */
export function analizarPuntual(id: ClasePuntual): AnalisisPuntual {
  const def = mutPuntualPorId(id);
  const codMutada = aplicarMutacion(BASE_CODIFICANTE, def.spec);
  const protOriginal = aminoacidosDe(BASE_CODIFICANTE);
  const protMutada = aminoacidosDe(codMutada);

  let cambioIdx = -1;
  const n = Math.max(protOriginal.length, protMutada.length);
  for (let i = 0; i < n; i++) {
    const a = protOriginal[i];
    const b = protMutada[i];
    if (!a || !b || a.codon !== b.codon) { cambioIdx = i; break; }
  }

  let efecto: string;
  switch (id) {
    case "silenciosa":
      efecto = "Proteína idéntica — el cambio no se nota en el fenotipo.";
      break;
    case "missense":
      efecto = "Un aminoácido cambia — puede alterar la función de la proteína.";
      break;
    case "nonsense":
      efecto = `Parada prematura — proteína truncada (${protMutada.filter((c) => !c.paro).length} aa en vez de ${protOriginal.filter((c) => !c.paro).length}).`;
      break;
    case "frameshift":
      efecto = "Se corre el marco — todos los aminoácidos siguientes cambian.";
      break;
    default:
      efecto = "Sin cambios: secuencia de referencia.";
  }
  return { def, codMutada, arnmOriginal: transcribir(BASE_CODIFICANTE), arnmMutado: transcribir(codMutada), protOriginal, protMutada, cambioIdx, efecto };
}

/* ════════════════════════════════════════════════════════════════════════
 * 2 · MUTACIONES CROMOSÓMICAS
 * ════════════════════════════════════════════════════════════════════════ */

export interface Banda {
  gen: string;
  color: string;
}
/** Banda de genes de un cromosoma "modelo" (5 segmentos). */
export const BANDAS_BASE: Banda[] = [
  { gen: "A", color: "#34d399" },
  { gen: "B", color: "#38bdf8" },
  { gen: "C", color: "#fbbf24" },
  { gen: "D", color: "#f472b6" },
  { gen: "E", color: "#a855f7" },
];

export type TipoCromo = "normal" | "delecion" | "duplicacion" | "inversion" | "translocacion" | "aneuploidia";

export interface MutCromoDef {
  id: TipoCromo;
  etq: string;
  clase: "estructural" | "numérica" | "normal";
  icono: string;
  color: string;
  descripcion: string;
  ejemplo: string;
}
export const MUTACIONES_CROMO: MutCromoDef[] = [
  {
    id: "normal",
    etq: "Cromosoma normal",
    clase: "normal",
    icono: "fa-circle-check",
    color: "#38bdf8",
    descripcion: "Cromosoma con su orden y número de genes correctos (par homólogo intacto).",
    ejemplo: "Referencia: secuencia de bandas A-B-C-D-E sin alteraciones.",
  },
  {
    id: "delecion",
    etq: "Deleción",
    clase: "estructural",
    icono: "fa-eraser",
    color: "#f87171",
    descripcion: "Se pierde un segmento del cromosoma. Los genes de esa región desaparecen.",
    ejemplo: "Síndrome de Cri-du-chat: deleción en el brazo corto del cromosoma 5.",
  },
  {
    id: "duplicacion",
    etq: "Duplicación",
    clase: "estructural",
    icono: "fa-clone",
    color: "#34d399",
    descripcion: "Un segmento se copia y aparece repetido. Hay dosis extra de esos genes.",
    ejemplo: "Enfermedad de Charcot-Marie-Tooth tipo 1A: duplicación del gen PMP22.",
  },
  {
    id: "inversion",
    etq: "Inversión",
    clase: "estructural",
    icono: "fa-arrows-rotate",
    color: "#fbbf24",
    descripcion: "Un segmento se rompe, gira 180° y se reinserta. El orden de esos genes queda invertido.",
    ejemplo: "Inversión del gen del factor VIII en muchos casos de hemofilia A grave.",
  },
  {
    id: "translocacion",
    etq: "Translocación",
    clase: "estructural",
    icono: "fa-right-left",
    color: "#60a5fa",
    descripcion: "Un fragmento de un cromosoma se traslada a otro cromosoma distinto (no homólogo).",
    ejemplo: "Cromosoma Filadelfia t(9;22): translocación en la leucemia mieloide crónica (A5).",
  },
  {
    id: "aneuploidia",
    etq: "Aneuploidía (trisomía 21)",
    clase: "numérica",
    icono: "fa-1",
    color: "#a855f7",
    descripcion: "Cambia el NÚMERO de cromosomas por no disyunción en la meiosis: aquí, tres copias del cromosoma 21 en vez de dos.",
    ejemplo: "Síndrome de Down: trisomía 21, 47 cromosomas en total (A1, A2, A5).",
  },
];
export function mutCromoPorId(id: TipoCromo): MutCromoDef {
  return MUTACIONES_CROMO.find((m) => m.id === id) ?? MUTACIONES_CROMO[0]!;
}

/** Resultado del cromosoma afectado (una o dos cadenas de bandas para el render). */
export interface ResultadoCromo {
  /** cromosoma principal resultante */
  principal: Banda[];
  /** segundo cromosoma (solo translocación) */
  secundario?: Banda[];
  /** número de copias del cromosoma (aneuploidía → 3) */
  copias: number;
  /** índices de bandas resaltadas como "afectadas" en el principal */
  marca: number[];
}
export function resultadoCromo(id: TipoCromo): ResultadoCromo {
  const base = BANDAS_BASE;
  switch (id) {
    case "delecion": {
      // elimina la banda C (índice 2)
      const principal = base.filter((_, i) => i !== 2);
      return { principal, copias: 1, marca: [2] };
    }
    case "duplicacion": {
      // duplica la banda C
      const principal = [base[0]!, base[1]!, base[2]!, base[2]!, base[3]!, base[4]!];
      return { principal, copias: 1, marca: [2, 3] };
    }
    case "inversion": {
      // invierte el segmento B-C-D (índices 1..3)
      const principal = [base[0]!, base[3]!, base[2]!, base[1]!, base[4]!];
      return { principal, copias: 1, marca: [1, 2, 3] };
    }
    case "translocacion": {
      // el segmento D-E pasa a un segundo cromosoma (de otro color de fondo)
      const principal = [base[0]!, base[1]!, base[2]!];
      const otro: Banda[] = [
        { gen: "M", color: "#475569" },
        { gen: "N", color: "#475569" },
        base[3]!,
        base[4]!,
      ];
      return { principal, secundario: otro, copias: 1, marca: [] };
    }
    case "aneuploidia":
      return { principal: base, copias: 3, marca: [] };
    default:
      return { principal: base, copias: 1, marca: [] };
  }
}

/* ════════════════════════════════════════════════════════════════════════
 * 3 · MUTÁGENOS
 * ════════════════════════════════════════════════════════════════════════ */

export type TipoMutageno = "uv" | "ionizante" | "quimico" | "biologico";

export interface MutagenoDef {
  id: TipoMutageno;
  etq: string;
  categoria: "Físico" | "Químico" | "Biológico";
  icono: string;
  color: string;
  agentes: string[];
  mecanismo: string;
  ejemplo: string;
}
export const MUTAGENOS: MutagenoDef[] = [
  {
    id: "uv",
    etq: "Radiación ultravioleta (UV)",
    categoria: "Físico",
    icono: "fa-sun",
    color: "#fbbf24",
    agentes: ["UV-B del Sol", "Camas de bronceado"],
    mecanismo: "Une covalentemente dos timinas adyacentes formando un dímero de timina, que deforma la doble hélice y bloquea la replicación.",
    ejemplo: "Principal causa del melanoma y otros cánceres de piel.",
  },
  {
    id: "ionizante",
    etq: "Radiación ionizante",
    categoria: "Físico",
    icono: "fa-radiation",
    color: "#f87171",
    agentes: ["Rayos X", "Rayos gamma"],
    mecanismo: "Provoca roturas de la doble cadena del ADN y radicales libres que dañan las bases.",
    ejemplo: "Exposición a dosis altas aumenta el riesgo de leucemias y otros cánceres.",
  },
  {
    id: "quimico",
    etq: "Mutágenos químicos",
    categoria: "Químico",
    icono: "fa-smoking",
    color: "#fb923c",
    agentes: ["Benzopirenos del tabaco", "Formaldehído", "Agentes alquilantes"],
    mecanismo: "Forman aductos en el ADN o alteran las bases, provocando errores durante la replicación.",
    ejemplo: "El humo del tabaco contiene más de 70 carcinógenos químicos (A5).",
  },
  {
    id: "biologico",
    etq: "Mutágenos biológicos",
    categoria: "Biológico",
    icono: "fa-virus",
    color: "#a855f7",
    agentes: ["VPH (virus del papiloma)", "Retrovirus", "Transposones"],
    mecanismo: "Integran su material genético en el genoma del hospedero, interrumpiendo o desregulando genes.",
    ejemplo: "El VPH se asocia al cáncer cervicouterino; los transposones saltan dentro del genoma.",
  },
];
export function mutagenoPorId(id: TipoMutageno): MutagenoDef {
  return MUTAGENOS.find((m) => m.id === id) ?? MUTAGENOS[0]!;
}

export const REPARACION =
  "Las células reparan el ADN dañado: la reparación por escisión de nucleótidos (NER) elimina los dímeros de timina; la reparación de emparejamientos erróneos (MMR) corrige errores de copia. Cuando estos sistemas fallan (p. ej. xeroderma pigmentoso) el riesgo de cáncer se dispara.";

/* ════════════════════════════════════════════════════════════════════════
 * TEXTO VERBATIM (A1 / A5 / A2 / A4 / A6)
 * ════════════════════════════════════════════════════════════════════════ */

export const PROBLEMA =
  "Una mutación es un cambio en la secuencia del ADN. En este laboratorio manipulas las tres familias de mutaciones: las puntuales (sobre una secuencia real de la β-globina), las cromosómicas y los mutágenos que las provocan, y observas en 3D cómo cada una afecta —o no— a la proteína, al cromosoma y a la salud.";

export const DEFINICION =
  "Una mutación es un cambio en la secuencia del ADN. Las mutaciones génicas afectan uno o pocos nucleótidos (sustitución, inserción o deleción); las cromosómicas afectan la estructura o el número de cromosomas.";

/** Párrafos verbatim de la lectura A1. */
export const LECTURA_A1: string[] = [
  "Una mutación es un cambio en la secuencia del ADN. Las mutaciones génicas afectan uno o pocos nucleótidos: sustitución (un nucleótido reemplaza a otro), inserción o deleción (se añade o elimina un nucleótido, causando desplazamiento del marco de lectura). Las mutaciones cromosómicas afectan la estructura o el número de cromosomas: deleción, duplicación, inversión, translocación y aneuploidía (ej. trisomía 21, síndrome de Down).",
  "Los mutágenos son agentes que aumentan la tasa de mutación. Los físicos incluyen la radiación ionizante (rayos X, gamma) y la radiación UV (forma dímeros de timina). Los químicos incluyen el humo del tabaco (benzopirenos, nitrosaminas), el formaldehído y los alquilantes. Los biológicos incluyen ciertos virus (VPH) y transposones.",
  "Las mutaciones somáticas ocurren en células del cuerpo y no se heredan a la descendencia; pueden acumular cambios en genes reguladores del ciclo celular y originar cáncer. Las mutaciones germinales ocurren en células reproductoras y pueden transmitirse a la siguiente generación, siendo la fuente de variabilidad genética en las poblaciones.",
  "Aunque la mayoría de las mutaciones son neutras o perjudiciales, algunas son beneficiosas: por ejemplo, la mutación que confiere resistencia a la malaria en portadores del rasgo falciforme (HbAS) es ventajosa en zonas endémicas. Las mutaciones son, en última instancia, el motor de la variación sobre la que actúa la selección natural.",
];

/** Preguntas de comprensión verbatim (A1). */
export const PREGUNTAS: string[] = [
  "¿Cuál es la diferencia entre una mutación génica puntual y una mutación cromosómica?",
  "¿Por qué las mutaciones somáticas no se heredan pero sí pueden causar cáncer?",
];

export const INSTRUCCIONES: string[] = [
  "Elige un tipo de estudio: mutaciones puntuales, cromosómicas o mutágenos.",
  "En puntuales, aplica una sustitución, inserción o deleción y observa el efecto en la proteína.",
  "Compara los cuatro efectos: silenciosa, sentido erróneo (missense), sin sentido (nonsense) y desplazamiento del marco (frameshift).",
  "En cromosómicas, prueba deleción, duplicación, inversión, translocación y aneuploidía (trisomía 21).",
  "En mutágenos, observa cómo la radiación UV forma un dímero de timina en la doble hélice.",
];

export const IDEAS: string[] = [
  "Una mutación es un cambio en la secuencia del ADN.",
  "Las mutaciones génicas afectan uno o pocos nucleótidos; las cromosómicas afectan la estructura o el número de cromosomas.",
  "Una sustitución puede ser silenciosa (sinónima), de sentido erróneo (missense) o sin sentido (nonsense).",
  "Inserciones o deleciones que no son múltiplo de tres desplazan el marco de lectura (frameshift).",
  "Los mutágenos pueden ser físicos (UV, rayos X), químicos (tabaco, formaldehído) o biológicos (virus como el VPH).",
  "Las mutaciones somáticas no se heredan pero pueden causar cáncer; las germinales sí se heredan.",
  "La mayoría de las mutaciones son neutras o perjudiciales, pero algunas son beneficiosas (p. ej. resistencia a la malaria).",
  "Las mutaciones son el motor de la variación sobre la que actúa la selección natural.",
];

export interface GlosarioItem {
  termino: string;
  definicion: string;
  ejemplo: string;
}
/** Glosario verbatim A5 (6 términos). */
export const GLOSARIO: GlosarioItem[] = [
  {
    termino: "Mutación génica puntual",
    definicion:
      "Cambio en uno o pocos pares de bases del ADN. Tipos: (1) Sustitución: una base se reemplaza por otra; puede ser sinónima (sin cambio de aminoácido), missense (cambia aminoácido) o nonsense (genera codón de parada prematuro). (2) Inserción/deleción de 1-2 bases: causa desplazamiento del marco de lectura (frameshift), alterando todos los aminoácidos siguientes.",
    ejemplo:
      "La anemia de células falciformes: sustitución A→T en el codón 6 del gen de la beta-globina → GAG (ácido glutámico) se convierte en GTG (valina) → hemoglobina S que se polimeriza en hipoxia.",
  },
  {
    termino: "Mutación cromosómica",
    definicion:
      "Cambio en la estructura o número de cromosomas. Estructurales: deleción (pérdida de segmento), duplicación, inversión, translocación. Numéricas: aneuploidía (pérdida o ganancia de cromosomas, ej: trisomía 21 = síndrome de Down) o poliploidía.",
    ejemplo:
      "Síndrome de Down (trisomía 21): células con 47 cromosomas por no disyunción durante la meiosis materna. El cromosoma de Filadelfia en leucemia mieloide crónica es una translocación t(9;22).",
  },
  {
    termino: "Mutágenos físicos, químicos y biológicos",
    definicion:
      "Agentes que aumentan la tasa de mutación. Físicos: radiación UV (dímeros de timina), rayos X y gamma (roturas de doble cadena). Químicos: benzopirenos del humo de tabaco, aflatoxinas, agentes alquilantes. Biológicos: virus que integran su ADN en el genoma (VPH, retrovirus).",
    ejemplo:
      "El tabaco contiene >70 carcinógenos químicos que dañan el ADN de células pulmonares; la mayoría de los cánceres de pulmón están asociados al consumo de tabaco.",
  },
  {
    termino: "Reparación del ADN",
    definicion:
      "Las células poseen sistemas de reparación para corregir errores de replicación y daños al ADN: (1) Reparación por escisión de nucleótidos (NER): elimina dímeros de timina y lesiones voluminosas. (2) Reparación de emparejamientos erróneos (MMR). (3) Unión de extremos no homólogos (NHEJ) para roturas de doble cadena. Fallos en estos sistemas aumentan el riesgo de cáncer.",
    ejemplo:
      "El síndrome de xeroderma pigmentoso es una enfermedad genética rara por deficiencia en NER: los pacientes no pueden reparar dímeros de timina y desarrollan cáncer de piel con exposición mínima al sol.",
  },
  {
    termino: "Mutaciones germinales vs somáticas",
    definicion:
      "Germinales: ocurren en células de la línea germinal (gametos); son heredables y afectan a toda la descendencia. Somáticas: ocurren en células del cuerpo del individuo; no son heredables, pero pueden causar cáncer si afectan genes reguladores del ciclo celular (proto-oncogenes, genes supresores de tumor).",
    ejemplo:
      "La fibrosis quística (mutación germinal del gen CFTR) se hereda. El melanoma surge de mutaciones somáticas en células de la piel inducidas por UV.",
  },
  {
    termino: "Variabilidad genética y evolución",
    definicion:
      "Las mutaciones introducen nuevos alelos en las poblaciones; la recombinación durante la meiosis crea nuevas combinaciones de alelos. Ambos procesos generan diversidad fenotípica sobre la que actúa la selección natural, la deriva génica y el flujo génico, impulsando la evolución.",
    ejemplo:
      "La resistencia de bacterias a los antibióticos evoluciona por mutaciones aleatorias en genes de resistencia, seguidas de selección positiva: las bacterias con mutación ventajosa sobreviven y se reproducen.",
  },
];

/** Hechos verbatim de los quizzes A2/A4 para tarjetas «¿sabías que?». */
export const HECHOS: string[] = [
  "Las inserciones o deleciones de un nucleótido desplazan el marco de lectura (frameshift), alterando todos los codones posteriores y generalmente produciendo una proteína no funcional.",
  "La radiación UV-B es un mutágeno físico que causa dímeros de timina; los benzopirenos y el formaldehído son químicos y el VPH es biológico.",
  "Las mutaciones germinales ocurren en gametos y pueden heredarse; las somáticas afectan solo al individuo y no se transmiten.",
  "La trisomía 21 (síndrome de Down) resulta de la no disyunción del cromosoma 21 en la meiosis: una mutación cromosómica numérica (aneuploidía).",
  "Muchas mutaciones missense son conservadoras: si el aminoácido sustituido tiene propiedades similares, la proteína puede seguir funcionando.",
];

export interface DatoCard {
  valor: string;
  texto: string;
  icono: string;
}
export const DATOS: DatoCard[] = [
  { valor: "1 base", texto: "El cambio A→T en el gen de la β-globina causa la anemia falciforme (Glu→Val).", icono: "fa-droplet" },
  { valor: "3 copias", texto: "La trisomía 21 (síndrome de Down) tiene tres cromosomas 21: 47 en total.", icono: "fa-clone" },
  { valor: ">70", texto: "carcinógenos químicos contiene el humo del tabaco, que dañan el ADN.", icono: "fa-smoking" },
  { valor: "UV", texto: "La radiación ultravioleta forma dímeros de timina, principal causa del cáncer de piel.", icono: "fa-sun" },
];

export const CONTEXTO =
  "En México, el INMEGEN (Instituto Nacional de Medicina Genómica) estudia las variantes y mutaciones del genoma de la población mexicana para diseñar diagnósticos y tratamientos más precisos. Comprender qué mutaciones son neutras, perjudiciales o protectoras es clave para la medicina personalizada.";

export const FUENTE =
  "Material elaborado para CEN Bachillerato — CNEYT-VI. Ref: Campbell, Biología (12a ed.); Alberts, Biología Molecular de la Célula. Código genético: referencia universal estándar.";

/* ════════════════════════════════════════════════════════════════════════
 * RETO EVALUABLE — quiz VERBATIM de CNEYT-VI-P06-A2 (quiz_multiple_opcion)
 * ════════════════════════════════════════════════════════════════════════ */

// VERBATIM de CNEYT-VI-P06-A2 «Quiz: Mutaciones y variabilidad genética».
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Quiz: Mutaciones y variabilidad genética",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Qué tipo de mutación génica desplaza el marco de lectura del ARNm?",
      opciones: [
        "Sustitución puntual silenciosa",
        "Inserción o deleción de un nucleótido",
        "Translocación cromosómica",
        "Inversión cromosómica",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Las inserciones o deleciones de un nucleótido desplazan el marco de lectura (frameshift), alterando todos los codones posteriores y generalmente produciendo una proteína no funcional.",
    },
    {
      enunciado: "¿Cuál de los siguientes es un mutágeno físico?",
      opciones: [
        "Benzopireno del tabaco",
        "VPH (virus del papiloma humano)",
        "Radiación ultravioleta UV-B",
        "Formaldehído",
      ],
      respuestaCorrecta: 2,
      retroalimentacion:
        "La radiación UV-B es un mutágeno físico que causa dímeros de timina en el ADN. Los benzopirenos y el formaldehído son mutágenos químicos; el VPH es un mutágeno biológico.",
    },
    {
      enunciado: "Las mutaciones germinales se diferencian de las somáticas porque:",
      opciones: [
        "Son siempre dañinas y causan cáncer",
        "Ocurren en células reproductoras y pueden transmitirse a la descendencia",
        "Solo afectan a células musculares",
        "No alteran la secuencia del ADN",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Las mutaciones germinales ocurren en gametos o células que los producen, por lo que pueden heredarse. Las somáticas afectan solo al individuo y no se transmiten.",
    },
    {
      enunciado: "¿Cuál es el papel de las mutaciones en la evolución?",
      opciones: [
        "Son siempre letales y eliminan especies",
        "Generan variabilidad genética sobre la que actúa la selección natural",
        "Solo afectan a individuos viejos",
        "Reducen la diversidad de alelos en la población",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Las mutaciones son la fuente última de nuevos alelos. La mayor parte son neutras o ligeramente perjudiciales, pero ocasionalmente producen variantes ventajosas que la selección natural puede favorecer.",
    },
    {
      enunciado: "La trisomía 21 (síndrome de Down) es un ejemplo de:",
      opciones: [
        "Mutación génica puntual",
        "Mutación cromosómica por aneuploidía",
        "Mutación por inserción de nucleótido",
        "Mutación somática causada por UV",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "La trisomía 21 resulta de la no disyunción del cromosoma 21 durante la meiosis, produciendo una célula con tres copias del cromosoma 21. Es una mutación cromosómica numérica (aneuploidía).",
    },
  ],
};
