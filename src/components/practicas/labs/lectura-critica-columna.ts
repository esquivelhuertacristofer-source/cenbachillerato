/**
 * Simulador «Lee la columna» (LabLecturaCritica, lectura-critica-postura).
 *
 * Dos columnas de opinión FICTICIAS: columnistas, diarios, planteles y cifras
 * son inventados (cifras = simulación). El alumno marca cada frase como dato
 * con fuente, afirmación sin fuente u opinión; el «medidor de solidez» y los
 * pilares del argumento reaccionan a cada marca.
 *
 * Solidez = peso de las premisas con fuente / peso de todas las premisas.
 * Las opiniones no pesan: no sostienen ni hunden, solo acompañan.
 */

export type Marca = "dato" | "sinfuente" | "opinion";
export type Decision = "aceptar" | "pedir" | "rechazar";

export const MARCA_INFO: Record<Marca, { etiqueta: string; icono: string; color: string; pista: string }> = {
  dato: {
    etiqueta: "Dato con fuente",
    icono: "fa-file-circle-check",
    color: "#3DDC97",
    pista: "Dice quién lo midió o dónde se comprueba.",
  },
  sinfuente: {
    etiqueta: "Afirma sin fuente",
    icono: "fa-circle-question",
    color: "#FF8A5E",
    pista: "Suena a hecho, pero no dice de dónde sale.",
  },
  opinion: {
    etiqueta: "Opinión",
    icono: "fa-comment",
    color: "#A78BFA",
    pista: "Es un juicio personal: no se comprueba.",
  },
};

export const ERROR_MARCA: Record<Marca, string> = {
  dato: "Ahí no. Esta frase sí nombra de dónde sale la información y se puede ir a comprobar: es un dato con fuente.",
  sinfuente: "Ahí no. Suena a hecho, pero nadie dice quién lo midió ni dónde verlo: afirma sin sostén.",
  opinion: "Ahí no. Es una valoración personal («me parece», «una vergüenza»): no se comprueba ni se desmiente, así que no prueba nada.",
};

export interface FraseColumna {
  id: string;
  texto: string;
  marca: Marca;
  /** Cuánto sostendría la conclusión si tuviera fuente (0 = opinión). */
  peso: number;
  porque: string;
}

export interface OpcionDecision {
  id: Decision;
  texto: string;
  correcta: boolean;
  porque: string;
}

export interface ColumnaOpinion {
  id: string;
  titulo: string;
  firma: string;
  diario: string;
  imagen: string;
  conclusion: string;
  frases: FraseColumna[];
  decision: OpcionDecision[];
  /** Mensaje al terminar, con la solidez calculada. */
  cierre: string;
}

export const COLUMNAS: ColumnaOpinion[] = [
  {
    id: "pantallas",
    titulo: "Las tabletas se comen el aprendizaje",
    firma: "Raimundo Sevilla Tapia",
    diario: "El Cronista del Valle (ficticio)",
    imagen: "columna-tabletas",
    conclusion: "Por todo esto, las tabletas deben retirarse del plantel de inmediato.",
    frases: [
      {
        id: "p1",
        texto: "Desde que el plantel repartió tabletas, nadie lee un libro completo.",
        marca: "sinfuente",
        peso: 2,
        porque: "«Nadie» es una generalización: no dice a quién preguntó ni qué contó.",
      },
      {
        id: "p2",
        texto: "En la encuesta que aplicó la biblioteca del plantel en septiembre, 61 % de primer año dijo leer menos de una hora por semana (simulación).",
        marca: "dato",
        peso: 2,
        porque: "Nombra quién preguntó, cuándo y a quiénes: se puede pedir la encuesta y revisarla.",
      },
      {
        id: "p3",
        texto: "Es una vergüenza que los jóvenes de hoy ya no sepan concentrarse.",
        marca: "opinion",
        peso: 0,
        porque: "«Vergüenza» es un juicio de valor del autor: ningún dato lo confirma ni lo desmiente.",
      },
      {
        id: "p4",
        texto: "Todos los especialistas coinciden en que las pantallas dañan la atención.",
        marca: "sinfuente",
        peso: 3,
        porque: "No nombra a ningún especialista ni estudio. «Todos» es una forma de aparentar respaldo.",
      },
      {
        id: "p5",
        texto: "El reglamento del plantel exige autorización docente para usar celulares en el aula (artículo 14).",
        marca: "dato",
        peso: 1,
        porque: "Cita un documento y un artículo: cualquiera puede ir a leerlo. Eso sí, solo prueba la regla, no el daño.",
      },
      {
        id: "p6",
        texto: "Mi sobrino, que pasa horas en el celular, reprobó dos materias.",
        marca: "sinfuente",
        peso: 2,
        porque: "Es una anécdota de un solo caso: no se puede comprobar ni generalizar a todo el plantel.",
      },
      {
        id: "p7",
        texto: "A mi parecer, la lectura en papel es insustituible.",
        marca: "opinion",
        peso: 0,
        porque: "«A mi parecer» marca una opinión: es respetable, pero no funciona como prueba.",
      },
    ],
    decision: [
      {
        id: "aceptar",
        texto: "Aceptarla: casi todas las frases la apoyan.",
        correcta: false,
        porque: "Contar frases no sirve: pesa lo que se puede comprobar. Las tres frases más pesadas no traen fuente.",
      },
      {
        id: "pedir",
        texto: "Suspender el juicio y pedir la evidencia que falta.",
        correcta: true,
        porque: "Solo una parte del argumento tiene respaldo comprobable. No está probado que sea falso, pero tampoco que sea cierto.",
      },
      {
        id: "rechazar",
        texto: "Rechazarla porque el columnista es un exagerado.",
        correcta: false,
        porque: "Eso ataca a la persona, no al argumento. Se critica lo que el texto prueba, no cómo cae el autor.",
      },
    ],
    cierre: "La columna aparenta fuerza (cifras, expertos, indignación), pero lo que realmente se sostiene es poco: aún falta evidencia.",
  },
  {
    id: "bicis",
    titulo: "Bicicletas al plantel: sí funciona",
    firma: "Marisol Quintana Ibarra",
    diario: "Gaceta de la Colonia Norte (ficticio)",
    imagen: "columna-bicicletas",
    conclusion: "Conviene ampliar el biciestacionamiento del plantel de 40 a 80 lugares.",
    frases: [
      {
        id: "b1",
        texto: "El comité de movilidad instaló en marzo 40 lugares para bicicletas, según su acta del 12 de marzo.",
        marca: "dato",
        peso: 1,
        porque: "Cita el acta y la fecha: se puede pedir y comprobar.",
      },
      {
        id: "b2",
        texto: "El conteo semanal de vigilancia muestra que el uso subió de 9 a 31 bicicletas diarias entre marzo y mayo (simulación).",
        marca: "dato",
        peso: 2,
        porque: "Dice quién contó y en qué periodo. Se puede revisar el registro.",
      },
      {
        id: "b3",
        texto: "Seguro que las bicicletas también mejoran el humor de todos.",
        marca: "sinfuente",
        peso: 1,
        porque: "«Seguro que» no trae medición ni fuente: es una suposición con tono de hecho.",
      },
      {
        id: "b4",
        texto: "Los retardos de la primera hora bajaron de 52 a 37 por semana, de acuerdo con el registro de prefectura (simulación).",
        marca: "dato",
        peso: 2,
        porque: "Nombra el registro de prefectura y da cifras antes y después: es comprobable.",
      },
      {
        id: "b5",
        texto: "Me parece que ir en bici es la mejor forma de empezar el día.",
        marca: "opinion",
        peso: 0,
        porque: "«Me parece» y «la mejor» son valoración personal; no pesa en el argumento.",
      },
      {
        id: "b6",
        texto: "El oficio municipal de abril reporta 60 % de avance en la ciclovía de la avenida Principal (simulación).",
        marca: "dato",
        peso: 1,
        porque: "Cita un oficio con fecha: es un documento que se puede pedir.",
      },
    ],
    decision: [
      {
        id: "aceptar",
        texto: "Aceptarla: casi todo lo que la apoya se puede comprobar.",
        correcta: true,
        porque: "La mayor parte del peso tiene fuente. Una frase floja («seguro que») no hunde un argumento que descansa en otras cuatro comprobables.",
      },
      {
        id: "pedir",
        texto: "Suspender el juicio: falta evidencia de todo.",
        correcta: false,
        porque: "Aquí sí hay evidencia comprobable en la mayoría de las premisas; pedir «todo» sería exagerar la duda.",
      },
      {
        id: "rechazar",
        texto: "Rechazarla porque una frase no tiene fuente.",
        correcta: false,
        porque: "Un solo hueco no invalida el resto. Se mide cuánto del argumento está sostenido, no si es perfecto.",
      },
    ],
    cierre: "Contraste con la primera columna: aquí el peso descansa sobre datos con fuente, y por eso el medidor sube.",
  },
];

export interface Estado {
  /** Marca puesta por el alumno y confirmada correcta, por id de frase. */
  marcadas: Record<string, Marca>;
}

/** Peso comprobado y peso sin sostén de las frases ya marcadas. */
export function pesosMarcados(col: ColumnaOpinion, marcadas: Record<string, Marca>) {
  let dato = 0;
  let hueco = 0;
  for (const f of col.frases) {
    if (!marcadas[f.id]) continue;
    if (f.marca === "dato") dato += f.peso;
    else if (f.marca === "sinfuente") hueco += f.peso;
  }
  return { dato, hueco };
}

/** Solidez 0..100 con lo marcado hasta ahora; null si todavía no hay nada. */
export function solidez(col: ColumnaOpinion, marcadas: Record<string, Marca>): number | null {
  const { dato, hueco } = pesosMarcados(col, marcadas);
  if (dato + hueco === 0) return null;
  return Math.round((dato / (dato + hueco)) * 100);
}
