/**
 * Datos y modelo del laboratorio "Archivo de fuentes históricas: crítica,
 * corroboración y uso ético de la evidencia" (CH-III-P02, progresión 2 de
 * Conciencia Histórica III — Metodología histórica avanzada).
 *
 * Progresión: «Examina de manera crítica las evidencias y evalúa su validez,
 * considerando los criterios de procedencia, intencionalidad y contexto, así
 * como el uso ético de la información y los posicionamientos».
 *
 * Anclas verbatim (CH-III-P02):
 *   - A1 video con preguntas «Corroboración de fuentes»: 4 reactivos del reto.
 *   - A2 verdadero/falso: retroalimentaciones del reto y hechos.
 *   - A3 debate «testimonios orales vs. documentos escritos»: panel de debate.
 *   - A4 verdadero/falso: 5 reactivos del reto.
 *   - A5 glosario (6 términos) y su actividad final.
 *   - A6 completa el texto. A7 autoevaluación: pregunta de reflexión.
 * Inspiración (verbatim cuando se cita): CH-III-P03-A1 lectura (anacronismo,
 * presentismo, determinismo) y CH-III-P04-A1 infografía (historia en redes y
 * criterio común de veracidad verificable).
 *
 * El CASO es real: la expropiación petrolera de 1938. Los HECHOS de contexto
 * son históricos y verificables. Los DOCUMENTOS del expediente (carta, nota de
 * diario, boletín, telegrama, fotografía, testimonio oral y la carta falsa) son
 * ILUSTRATIVOS: verosímiles y coherentes con la época, con autores, periódico,
 * compañía y archivos ficticios. No reproducen textos reales ni atribuyen
 * frases a personas reales.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "ficha" | "corroborar" | "etica";
export const MODOS: Modo[] = ["ficha", "corroborar", "etica"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  ficha: { etq: "Ficha de procedencia", subtitulo: "Quién, cuándo, para quién y para qué", icono: "fa-magnifying-glass", color: "#fbbf24" },
  corroborar: { etq: "Corroborar", subtitulo: "Hilos entre fuentes y la fuente imposible", icono: "fa-diagram-project", color: "#38bdf8" },
  etica: { etq: "Uso ético e interpretación", subtitulo: "Contexto, cita y una tesis con evidencias", icono: "fa-scale-balanced", color: "#c084fc" },
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

/** Sin acentos, sin mayúsculas, sin puntuación y con espacios simples. */
export function normaliza(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toLowerCase()
    .replace(/[.,;:!?¡¿"'()«»]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ════════════════════════════════════════════════════════════════════════
 * EL CASO: la expropiación petrolera de 1938 (hechos reales)
 * ════════════════════════════════════════════════════════════════════════ */

export const CASO_TITULO = "La expropiación petrolera de 1938";

export const CONTEXTO: { anio: string; texto: string }[] = [
  { anio: "1935–1937", texto: "Se funda el Sindicato de Trabajadores Petroleros de la República Mexicana (1935). En 1937 va a huelga para exigir un contrato colectivo a las compañías extranjeras." },
  { anio: "Diciembre de 1937", texto: "La Junta Federal de Conciliación y Arbitraje falla a favor de los trabajadores: las compañías deben mejorar salarios y prestaciones." },
  { anio: "1 de marzo de 1938", texto: "La Suprema Corte de Justicia niega el amparo a las compañías, que se niegan a cumplir el fallo." },
  { anio: "18 de marzo de 1938", texto: "El presidente Lázaro Cárdenas anuncia por radio, en la noche, la expropiación de los bienes de las compañías petroleras extranjeras, con base en la Ley de Expropiación de 1936 y el artículo 27 constitucional." },
  { anio: "Marzo y abril de 1938", texto: "Grandes manifestaciones de apoyo en la capital y colectas populares, como la de mujeres frente al Palacio de Bellas Artes en abril, para contribuir al pago de la indemnización." },
  { anio: "7 de junio de 1938", texto: "Se crea por decreto Petróleos Mexicanos (Pemex)." },
  { anio: "1938–1947", texto: "Las compañías responden con un boicot a la venta del petróleo mexicano; los trabajadores mantienen operando las instalaciones con serias dificultades. En los años cuarenta México pacta indemnizaciones con las empresas estadounidenses y con la británica El Águila." },
];

/** Datos de contexto que desenmascaran la fuente falsa. */
export const DATO_TV = "En México no había transmisiones de televisión para el público en 1938: la televisión comercial comenzó en 1950 con XHTV, canal 4.";
export const DATO_PEMEX = "Petróleos Mexicanos (Pemex) se creó por decreto el 7 de junio de 1938: el 19 de marzo nadie podía firmar un contrato con Pemex.";

/* ════════════════════════════════════════════════════════════════════════
 * 1. FICHA DE PROCEDENCIA
 * ════════════════════════════════════════════════════════════════════════ */

export type ZonaId = "membrete" | "fecha" | "destinatario" | "cuerpo" | "firma" | "reverso";
export const ZONAS: ZonaId[] = ["membrete", "fecha", "destinatario", "cuerpo", "firma", "reverso"];
export const ZONA_DEF: Record<ZonaId, { etq: string; icono: string }> = {
  membrete: { etq: "Membrete", icono: "fa-heading" },
  fecha: { etq: "Fecha y lugar", icono: "fa-calendar-day" },
  destinatario: { etq: "Destinatario", icono: "fa-envelope-open" },
  cuerpo: { etq: "Cuerpo del texto", icono: "fa-align-left" },
  firma: { etq: "Firma", icono: "fa-signature" },
  reverso: { etq: "Reverso y sello", icono: "fa-stamp" },
};

export type CampoId = "autor" | "fecha" | "destinatario" | "intencion" | "cercania";
export const CAMPOS: CampoId[] = ["autor", "fecha", "destinatario", "intencion", "cercania"];
export const CAMPO_DEF: Record<CampoId, { etq: string; pregunta: string; zona: ZonaId }> = {
  autor: { etq: "Autor", pregunta: "¿Quién lo produjo?", zona: "firma" },
  fecha: { etq: "Fecha y lugar", pregunta: "¿Cuándo y dónde?", zona: "fecha" },
  destinatario: { etq: "Destinatario", pregunta: "¿Para quién?", zona: "destinatario" },
  intencion: { etq: "Intención", pregunta: "¿Para qué lo escribió?", zona: "cuerpo" },
  cercania: { etq: "Cercanía al hecho", pregunta: "¿Qué tan cerca estuvo del hecho?", zona: "reverso" },
};

export type SoporteId = "carta" | "periodico" | "boletin" | "telegrama";

export interface Documento {
  id: SoporteId;
  etq: string;
  /** Lo que es, dicho como en un inventario de archivo. */
  descripcion: string;
  papel: string;
  tinta: string;
  /** Texto que aparece en cada zona del documento (anverso y reverso). */
  zonas: Record<ZonaId, string>;
  /** Pista que da la lupa al examinar cada zona. */
  pistas: Record<ZonaId, string>;
  /** Opciones de cada campo: la PRIMERA es la correcta (se muestran barajadas). */
  campos: Record<CampoId, string[]>;
  /** Por qué es la respuesta correcta, citando lo que muestra el documento. */
  porque: Record<CampoId, string>;
  util: string;
  cuidado: string;
}

export const DOCUMENTOS: Documento[] = [
  {
    id: "carta",
    etq: "Carta de un trabajador petrolero",
    descripcion: "Carta manuscrita con su sobre (documento ilustrativo).",
    papel: "#efe3c4",
    tinta: "#27325a",
    zonas: {
      membrete: "(Hoja de cuaderno rayada, sin membrete)",
      fecha: "Minatitlán, Ver., a 20 de marzo de 1938.",
      destinatario: "Querida hermana Refugio:",
      cuerpo:
        "Te escribo con prisa porque aquí no hay descanso. El viernes en la noche oímos en el local del sindicato, por el radio, al señor presidente decir que el petróleo es de la Nación. Hubo gritos y varios lloramos. Al otro día los jefes extranjeros ya no se presentaron y nosotros seguimos con la refinería prendida, aunque nadie sabe cómo vamos a sacar la paga. Te cuento para que no creas lo que digan los periódicos de allá: aquí nadie se rindió.",
      firma: "Tu hermano que te quiere, Anselmo Ruiz, obrero de la refinería.",
      reverso: "Sobre: Sra. Refugio Ruiz, San Luis Potosí, S. L. P. · Matasellos: MINATITLÁN VER. 21 MAR 1938 · Etiqueta: «Donada al archivo por la familia en 1986».",
    },
    pistas: {
      membrete: "No hay membrete: es papel común, no de una oficina. Apunta a un escrito privado.",
      fecha: "Escrita en Minatitlán, Veracruz, el 20 de marzo de 1938: dos días después del anuncio.",
      destinatario: "«Querida hermana»: se dirige a una sola persona de su familia.",
      cuerpo: "«oímos… por el radio», «seguimos con la refinería prendida», «para que no creas lo que digan los periódicos».",
      firma: "Firma Anselmo Ruiz, «obrero de la refinería».",
      reverso: "El matasellos confirma que salió de Minatitlán el 21 de marzo de 1938. La familia la donó en 1986: esa es la fecha en que llegó al archivo, no la fecha en que se escribió.",
    },
    campos: {
      autor: ["Un obrero de la refinería de Minatitlán", "El gerente extranjero de la refinería", "Un periodista de la capital", "Un funcionario del gobierno"],
      fecha: ["Minatitlán, 20 de marzo de 1938", "Ciudad de México, 18 de marzo de 1938", "San Luis Potosí, 21 de marzo de 1938", "Minatitlán, 1986"],
      destinatario: ["Su hermana, en privado", "Los lectores de un periódico", "El presidente de la República", "Los accionistas de la compañía"],
      intencion: ["Contar a su familia lo que vivió y tranquilizarla", "Convencer al gobierno de pagar a las compañías", "Informar oficialmente a otro gobierno", "Vender más ejemplares"],
      cercania: ["Testigo directo, dos días después del hecho", "Contemporáneo, pero lejos del hecho", "Recuerdo escrito décadas después", "Historiador que analiza otras fuentes"],
    },
    porque: {
      autor: "La firma dice «obrero de la refinería» y la fecha lo sitúa en Minatitlán.",
      fecha: "La carta está fechada en Minatitlán el 20 de marzo de 1938. San Luis Potosí es el destino y 1986 es cuando se donó.",
      destinatario: "Empieza con «Querida hermana»: es correspondencia privada, no escrita para publicarse.",
      intencion: "Le cuenta lo que vivió «para que no creas lo que digan los periódicos»: quiere informarla y tranquilizarla.",
      cercania: "Él oyó el anuncio y trabajaba en la refinería; escribe dos días después, como confirma el matasellos.",
    },
    util: "Es la vivencia directa de un trabajador: cómo se recibió la noticia y qué pasó en una refinería.",
    cuidado: "Es una sola voz, local y con interés en el resultado: no prueba lo que ocurrió en todo el país.",
  },
  {
    id: "periodico",
    etq: "Nota de un diario afín al gobierno",
    descripcion: "Página de un diario capitalino de nombre ficticio (documento ilustrativo).",
    papel: "#e9e2cf",
    tinta: "#141414",
    zonas: {
      membrete: "EL PUEBLO EN MARCHA · Diario de la mañana · Año IV, núm. 1203",
      fecha: "México, D. F., jueves 24 de marzo de 1938",
      destinatario: "Circulación en la capital y en los estados",
      cuerpo:
        "¡TODO MÉXICO CON EL PRESIDENTE! Una multitud desbordante llenó ayer la Plaza de la Constitución para respaldar la patriótica decisión del 18 de marzo. Obreros, campesinos, estudiantes y maestros desfilaron durante horas. No hubo un solo mexicano que no aplaudiera: la Nación entera, sin excepción, cerró filas contra las compañías.",
      firma: "(Nota sin firma) · De nuestra Redacción",
      reverso: "Anuncios comerciales y la cartelera de cine · Sello: «Hemeroteca — ejemplar de consulta».",
    },
    pistas: {
      membrete: "Un diario de la mañana que se vende en todo el país. Su línea editorial es afín al gobierno.",
      fecha: "Publicado en la Ciudad de México el jueves 24 de marzo de 1938, el día después del desfile.",
      destinatario: "Circula en la capital y en los estados: está escrito para el público lector.",
      cuerpo: "Palabras que valoran, no solo describen: «patriótica decisión», «sin excepción», «cerró filas».",
      firma: "No hay autor con nombre: la nota es de la Redacción del diario.",
      reverso: "Se conserva en una hemeroteca. Se publicó al día siguiente del acto que narra.",
    },
    campos: {
      autor: ["La redacción de un diario afín al gobierno, sin firma", "Un obrero que participó en el desfile", "Un diplomático extranjero", "Una historiadora de 1988"],
      fecha: ["Ciudad de México, 24 de marzo de 1938", "Ciudad de México, 18 de marzo de 1938", "Minatitlán, 23 de marzo de 1938", "Nueva York, 2 de abril de 1938"],
      destinatario: ["El público lector de todo el país", "Una sola persona, en privado", "Los accionistas extranjeros", "Un ministro de otro país"],
      intencion: ["Celebrar la decisión y sumar apoyo al gobierno", "Denunciar la expropiación como un despojo", "Informar en secreto a otro gobierno", "Pedir ayuda a un familiar"],
      cercania: ["Contemporáneo: publicado al día siguiente del acto", "Testigo privado que escribe a su familia", "Recuerdo grabado cincuenta años después", "Documento de otra época, sin relación con el hecho"],
    },
    porque: {
      autor: "La nota no está firmada: dice «De nuestra Redacción» bajo el membrete del diario.",
      fecha: "El encabezado dice «México, D. F., jueves 24 de marzo de 1938»; el desfile fue «ayer».",
      destinatario: "Circula en la capital y en los estados: habla a miles de lectores.",
      intencion: "Usa palabras de elogio y afirma que nadie se opuso: busca celebrar y sumar apoyo, no solo informar.",
      cercania: "Se escribió en los días del hecho y en la misma ciudad, pero desde un medio con postura.",
    },
    util: "Muestra el discurso de la prensa afín al gobierno y confirma que hubo una movilización grande.",
    cuidado: "Exagera («sin excepción»): no sirve para medir cuántas personas apoyaban la medida.",
  },
  {
    id: "boletin",
    etq: "Boletín de una compañía expropiada",
    descripcion: "Boletín de prensa traducido del inglés; compañía de nombre ficticio (documento ilustrativo).",
    papel: "#f4f4f0",
    tinta: "#1f2937",
    zonas: {
      membrete: "COMPAÑÍA PETROLERA DEL GOLFO · Oficina de Relaciones Públicas · Nueva York",
      fecha: "Nueva York, 2 de abril de 1938",
      destinatario: "PARA LA PRENSA Y LOS ACCIONISTAS · Difusión inmediata",
      cuerpo:
        "El gobierno de México se ha apoderado de propiedades legítimas sin pagar un solo dólar. Esta confiscación viola todo principio de derecho. Sin nuestros ingenieros, los pozos y las refinerías no podrán operar y la producción se desplomará en semanas. Las manifestaciones de apoyo fueron organizadas por el partido oficial y los sindicatos.",
      firma: "Departamento de Relaciones Públicas",
      reverso: "Nota a lápiz: «Traducción del inglés» · Sello: «Copia de la colección de un despacho de abogados».",
    },
    pistas: {
      membrete: "Es papel oficial de una de las compañías expropiadas, desde su oficina de Nueva York.",
      fecha: "Nueva York, 2 de abril de 1938: dos semanas después y a miles de kilómetros.",
      destinatario: "«Para la prensa y los accionistas»: quiere llegar a la opinión pública extranjera y a quienes invirtieron.",
      cuerpo: "«confiscación», «viola todo principio», «se desplomará»: acusa y predice; no describe lo que vio.",
      firma: "Lo firma su departamento de relaciones públicas, la oficina que cuida la imagen de la empresa.",
      reverso: "Es una traducción: hay que tener presente que el original está en inglés.",
    },
    campos: {
      autor: ["El área de relaciones públicas de una compañía expropiada", "Un trabajador mexicano de la refinería", "La redacción de un diario afín al gobierno", "Un juez de la Suprema Corte"],
      fecha: ["Nueva York, 2 de abril de 1938", "Ciudad de México, 18 de marzo de 1938", "Nueva York, 1942", "Minatitlán, 20 de marzo de 1938"],
      destinatario: ["La prensa y los accionistas en el extranjero", "Los trabajadores petroleros mexicanos", "Una hermana, en privado", "Los visitantes de un museo"],
      intencion: ["Presentar la expropiación como ilegal y buscar presión contra México", "Celebrar la decisión del presidente", "Registrar con neutralidad lo ocurrido", "Contar una vivencia familiar"],
      cercania: ["Contemporáneo, escrito por una parte afectada y a distancia", "Testigo directo sin interés en el resultado", "Recuerdo oral décadas después", "Estudio de un historiador"],
    },
    porque: {
      autor: "El membrete es de la compañía y lo firma su departamento de relaciones públicas.",
      fecha: "Encabezado: «Nueva York, 2 de abril de 1938».",
      destinatario: "Lo dice el propio boletín: «Para la prensa y los accionistas».",
      intencion: "Llama «confiscación» a la medida y dice que «viola todo principio de derecho»: busca opinión pública y presión en contra.",
      cercania: "Es de la época, pero lo escribe la parte que perdió sus bienes, desde otro país.",
    },
    util: "Muestra los argumentos y la estrategia de las compañías frente a la expropiación.",
    cuidado: "Es parte interesada; «se desplomará» es una predicción, no un hecho comprobado.",
  },
  {
    id: "telegrama",
    etq: "Telegrama diplomático",
    descripcion: "Telegrama cifrado de la legación de un país europeo, ya descifrado (documento ilustrativo).",
    papel: "#f1ead2",
    tinta: "#1b1b1b",
    zonas: {
      membrete: "LEGACIÓN EN MÉXICO · TELEGRAMA CIFRADO N.º 47 · CONFIDENCIAL",
      fecha: "MÉXICO, 19 DE MARZO DE 1938, 11:40 H",
      destinatario: "AL SEÑOR MINISTRO DE ASUNTOS EXTERIORES",
      cuerpo:
        "PRESIDENTE CÁRDENAS ANUNCIÓ ANOCHE POR RADIO EXPROPIACIÓN BIENES COMPAÑÍAS PETROLERAS EXTRANJERAS PUNTO CALLES CAPITAL TRANQUILAS PUNTO GOBIERNO CUENTA AMPLIO APOYO SINDICAL PUNTO COMPAÑÍAS CONFÍAN GOBIERNO NO PODRÁ OPERAR INDUSTRIA PUNTO RECOMIENDO PRUDENCIA PUNTO",
      firma: "EL ENCARGADO DE NEGOCIOS",
      reverso: "Sello: «Archivo diplomático — desclasificado» · Anotación: «Descifrado el 19-III-1938».",
    },
    pistas: {
      membrete: "«Cifrado» y «confidencial»: no se escribió para publicarse.",
      fecha: "Enviado desde la Ciudad de México el 19 de marzo de 1938 a las 11:40, la mañana siguiente al anuncio.",
      destinatario: "Va dirigido a su propio ministro de Asuntos Exteriores.",
      cuerpo: "«anunció anoche por radio», «calles tranquilas», «compañías confían gobierno no podrá operar», «recomiendo prudencia».",
      firma: "Lo firma el encargado de negocios: el diplomático al frente de la legación.",
      reverso: "Pasó décadas en un archivo diplomático y se desclasificó después: por eso hoy podemos leerlo.",
    },
    campos: {
      autor: ["El encargado de negocios de una legación extranjera", "El presidente Lázaro Cárdenas", "Un obrero del sindicato", "La redacción de un diario"],
      fecha: ["Ciudad de México, 19 de marzo de 1938", "Nueva York, 2 de abril de 1938", "Ciudad de México, 7 de junio de 1938", "Minatitlán, 20 de marzo de 1938"],
      destinatario: ["Su ministro de Asuntos Exteriores, en secreto", "El público mexicano", "Los accionistas de las compañías", "Su familia"],
      intencion: ["Informar a su gobierno para que decida qué hacer", "Celebrar la expropiación", "Denunciar públicamente a México", "Contar una vivencia personal"],
      cercania: ["Contemporáneo: observador extranjero en la capital, al día siguiente", "Participante directo en el sindicato", "Recuerdo escrito décadas después", "Interpretación de un historiador"],
    },
    porque: {
      autor: "La firma es «El encargado de negocios» de la legación.",
      fecha: "«México, 19 de marzo de 1938, 11:40 h»: la mañana después del anuncio.",
      destinatario: "Va «al señor ministro de Asuntos Exteriores» y es confidencial.",
      intencion: "Informa y recomienda «prudencia»: quiere que su gobierno decida con información.",
      cercania: "Estaba en la capital y escribió horas después, pero como observador externo que no participó.",
    },
    util: "Observador externo que escribe en privado: sirve para fechar el anuncio y conocer el ambiente en la capital.",
    cuidado: "Ve la capital, no las refinerías, y repite lo que esperan las compañías.",
  },
];

/** Orden en que se muestran las opciones de un campo (fijo: nada de azar en el render). */
export function ordenOpciones(doc: SoporteId, campo: CampoId): number[] {
  const semilla = [...`${doc}-${campo}`].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  return baraja([0, 1, 2, 3], mulberry32(semilla));
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. CORROBORAR — el tablero de corcho
 * ════════════════════════════════════════════════════════════════════════ */

export type FuenteId = "carta" | "periodico" | "boletin" | "telegrama" | "foto" | "oral" | "falsa";
export const FUENTES_TABLERO: FuenteId[] = ["carta", "periodico", "telegrama", "boletin", "foto", "oral", "falsa"];

export const FUENTE_DEF: Record<FuenteId, { etq: string; corta: string; tipo: string; resumen: string; icono: string; color: string }> = {
  carta: { etq: "Carta de un obrero (Minatitlán, 20-III-1938)", corta: "Carta del obrero", tipo: "Escrita privada", resumen: "«oímos en el local del sindicato, por el radio, al señor presidente»; «seguimos con la refinería prendida».", icono: "fa-envelope", color: "#efe3c4" },
  periodico: { etq: "Diario afín al gobierno (24-III-1938)", corta: "Diario oficialista", tipo: "Prensa", resumen: "«Una multitud desbordante llenó ayer la Plaza»; «la Nación entera, sin excepción, cerró filas».", icono: "fa-newspaper", color: "#e9e2cf" },
  telegrama: { etq: "Telegrama de una legación (19-III-1938)", corta: "Telegrama diplomático", tipo: "Diplomática", resumen: "«ANUNCIÓ ANOCHE POR RADIO»; «GOBIERNO CUENTA AMPLIO APOYO SINDICAL»; «COMPAÑÍAS CONFÍAN GOBIERNO NO PODRÁ OPERAR».", icono: "fa-tower-broadcast", color: "#f1ead2" },
  boletin: { etq: "Boletín de una compañía (Nueva York, 2-IV-1938)", corta: "Boletín de la compañía", tipo: "Empresa afectada", resumen: "«no podrán operar y la producción se desplomará»; «las manifestaciones fueron organizadas por el partido oficial y los sindicatos».", icono: "fa-building", color: "#f4f4f0" },
  foto: { etq: "Fotografía: colecta en Bellas Artes (IV-1938)", corta: "Fotografía de la colecta", tipo: "Iconográfica", resumen: "Mujeres de distintas edades hacen fila para entregar joyas, dinero y aves de corral frente al Palacio de Bellas Artes.", icono: "fa-camera-retro", color: "#d9c7a3" },
  oral: { etq: "Testimonio oral grabado en 1988", corta: "Testimonio oral", tipo: "Oral", resumen: "Doña Elvira, 61 años: «Yo tenía once años. Mi mamá llevó su anillo de bodas y una gallina a Bellas Artes. Nadie nos obligó; en el barrio todos hablaban del petróleo».", icono: "fa-microphone-lines", color: "#cfe3d4" },
  falsa: { etq: "Carta de un ingeniero, «19-III-1938» (vendida en internet)", corta: "Carta del ingeniero", tipo: "Procedencia dudosa", resumen: "«Tampico, 19 de marzo de 1938. Anoche vimos al presidente en la televisión del casino…»", icono: "fa-circle-question", color: "#e7dcc0" },
};

/** La carta falsa, partida en fragmentos que el alumno examina con la lupa. */
export const FRAGMENTOS_FALSA: { texto: string; anacronismo: boolean; explica: string }[] = [
  { texto: "Tampico, 19 de marzo de 1938.", anacronismo: false, explica: "Tampico era un centro petrolero y la fecha es verosímil: por sí sola no delata nada." },
  { texto: "Estimado primo: anoche vimos al presidente en la televisión del casino.", anacronismo: true, explica: DATO_TV },
  { texto: "Las compañías se llevaron a sus técnicos.", anacronismo: false, explica: "Es plausible y coincide con otras fuentes: no es imposible para la época." },
  { texto: "Ya firmamos contrato con Pemex para seguir en la refinería.", anacronismo: true, explica: DATO_PEMEX },
  { texto: "Aquí todo el mundo apoya la medida.", anacronismo: false, explica: "Es una generalización exagerada, pero no es imposible para 1938: es sesgo, no anacronismo." },
];

export type Relacion = "corrobora" | "contradice";

export interface Afirmacion {
  id: "anuncio" | "apoyo" | "paralisis";
  texto: string;
  /** Relaciones aceptadas por fuente (null = no dice nada sobre la afirmación). */
  acepta: Record<FuenteId, (Relacion | null)[]>;
  /** Nota que explica la relación de cada fuente con esta afirmación. */
  nota: Partial<Record<FuenteId, string>>;
  veredicto: VeredictoId;
  explica: string;
}

export type VeredictoId = "corroborada" | "matices" | "suspender" | "refutada";
export const VEREDICTOS: { id: VeredictoId; etq: string; icono: string }[] = [
  { id: "corroborada", etq: "Corroborada", icono: "fa-circle-check" },
  { id: "matices", etq: "Corroborada, con matices", icono: "fa-circle-half-stroke" },
  { id: "suspender", etq: "Fuentes en conflicto: suspender el juicio", icono: "fa-pause" },
  { id: "refutada", etq: "Refutada", icono: "fa-circle-xmark" },
];

export const AFIRMACIONES: Afirmacion[] = [
  {
    id: "anuncio",
    texto: "El presidente anunció la expropiación por radio la noche del 18 de marzo de 1938.",
    acepta: { carta: ["corrobora"], telegrama: ["corrobora"], periodico: [null, "corrobora"], boletin: [null], foto: [null], oral: [null], falsa: [null] },
    nota: {
      carta: "La carta: «el viernes en la noche oímos… por el radio» (el 18 de marzo de 1938 fue viernes).",
      telegrama: "El telegrama del 19: «anunció anoche por radio».",
      periodico: "El diario solo menciona «la decisión del 18 de marzo», no el medio ni la hora.",
      falsa: "La carta del ingeniero dice que lo vieron «en la televisión»: antes de usarla, revísala con la lupa.",
      boletin: "El boletín no habla del anuncio.",
    },
    veredicto: "corroborada",
    explica: "Dos fuentes independientes, de distinto origen y escritas en los días del hecho —un obrero en Minatitlán y un diplomático en la capital— coinciden en la fecha, la hora y el medio.",
  },
  {
    id: "apoyo",
    texto: "La expropiación tuvo un apoyo popular amplio.",
    acepta: { periodico: ["corrobora"], foto: ["corrobora"], oral: ["corrobora"], telegrama: ["corrobora"], carta: ["corrobora", null], boletin: ["contradice"], falsa: [null] },
    nota: {
      periodico: "El diario narra una multitud en la Plaza, aunque exagera («sin excepción»).",
      foto: "La fotografía muestra una fila larga de mujeres donando.",
      oral: "El testimonio: «nadie nos obligó; en el barrio todos hablaban del petróleo».",
      telegrama: "El diplomático informa «amplio apoyo sindical».",
      carta: "La carta muestra entusiasmo entre los obreros de una refinería.",
      boletin: "El boletín sostiene que las manifestaciones «fueron organizadas»: disputa que el apoyo fuera espontáneo.",
      falsa: "«Todo el mundo apoya» no vale como evidencia en una fuente con anacronismos.",
    },
    veredicto: "matices",
    explica: "Fuentes de tipos distintos —prensa, imagen, testimonio oral y un observador extranjero— coinciden: hubo apoyo amplio. Pero el diario exagera y la compañía afirma que fue organizado; lo más sólido es decir que fue amplio y diverso, sin afirmar que fue unánime ni del todo espontáneo.",
  },
  {
    id: "paralisis",
    texto: "Sin los técnicos extranjeros, las refinerías dejaron de funcionar.",
    acepta: { carta: ["contradice"], boletin: [null, "corrobora"], telegrama: [null, "corrobora"], periodico: [null], foto: [null], oral: [null], falsa: [null] },
    nota: {
      carta: "El obrero escribe «seguimos con la refinería prendida»: lo contradice, al menos en Minatitlán.",
      boletin: "El boletín solo PREDICE que «no podrán operar»: predecir no es constatar, y la compañía es parte interesada.",
      telegrama: "El telegrama repite lo que «confían» las compañías: es una expectativa, no un hecho observado.",
    },
    veredicto: "suspender",
    explica: "Nadie constató la parálisis: solo hay predicciones de la parte interesada, y la única fuente directa la contradice en una sola refinería. Con este expediente conviene suspender el juicio y buscar evidencia independiente, como registros de producción. (Históricamente, los trabajadores mantuvieron operando las instalaciones, con serias dificultades por el boicot.)",
  },
];

export type Hilos = Partial<Record<FuenteId, Relacion>>;

/** Fuentes cuya relación marcada no está entre las aceptadas. */
export function hilosErroneos(a: Afirmacion, hilos: Hilos): FuenteId[] {
  return FUENTES_TABLERO.filter((f) => !a.acepta[f].includes(hilos[f] ?? null));
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. USO ÉTICO — la foto descontextualizada
 * ════════════════════════════════════════════════════════════════════════ */

export const POST = {
  cuenta: "@memoria.viral",
  aviso: "Cuenta y publicación ficticias",
  texto: "ASÍ protestaban las señoras contra el gasolinazo de 2017. ¡Eso sí era valor! Compártelo.",
  reacciones: "18.4 mil · 6.1 mil compartidos",
};

export const PIE_ORIGINAL = "Mujeres entregan donativos para el pago de la deuda petrolera. Palacio de Bellas Artes, México, D. F., 12 de abril de 1938.";
export const SELLO_FOTO = "Archivo fotográfico · Negativo 4471 · Reproducción ilustrativa";

export const PROBLEMAS_POST: { id: string; texto: string; correcto: boolean; explica: string }[] = [
  { id: "recorte", texto: "Recorta la foto y deja fuera lo que explica la escena", correcto: true, explica: "El recorte oculta la mesa de donativos y el letrero: sin ellos, los brazos en alto parecen puños." },
  { id: "fecha", texto: "Cambia la fecha y el acontecimiento", correcto: true, explica: "La foto es de 1938 y muestra una colecta, no una protesta de 2017." },
  { id: "cita", texto: "No dice de dónde viene la foto ni quién la conserva", correcto: true, explica: "Sin crédito ni archivo nadie puede verificarla: falla la veracidad verificable." },
  { id: "personas", texto: "Atribuye a las personas retratadas una protesta que no hicieron", correcto: true, explica: "Usa a mujeres reales para una causa que no eligieron: es un problema ético, no solo de datos." },
  { id: "montaje", texto: "La fotografía es un montaje digital", correcto: false, explica: "La foto es auténtica: el engaño no está en la imagen, sino en el contexto que le pusieron." },
  { id: "prohibido", texto: "Nunca deberían compartirse fotos históricas en redes", correcto: false, explica: "Sí se pueden compartir: con contexto, fecha y crédito. El problema es cómo se usó." },
];

export interface CriterioReescritura {
  id: string;
  etq: string;
  ayuda: string;
  cumple: (t: string) => boolean;
}

const tiene = (t: string, re: RegExp) => re.test(normaliza(t));
const corrige = /\b(no es|no fue|no era|falso|falsa|en realidad|corrig|aclar|desmient|equivoc|no tiene que ver|no corresponde)/;

export const CRITERIOS_REESCRITURA: CriterioReescritura[] = [
  { id: "fecha", etq: "Fecha correcta (1938)", ayuda: "¿Cuándo se tomó la foto?", cumple: (t) => tiene(t, /\b1938\b/) },
  { id: "lugar", etq: "Lugar (Bellas Artes)", ayuda: "¿Dónde ocurrió?", cumple: (t) => tiene(t, /bellas artes/) },
  { id: "hecho", etq: "Qué ocurrió en realidad", ayuda: "¿Qué hacían esas mujeres y por qué?", cumple: (t) => tiene(t, /(donativ|donacion|donaban|donar|colecta|deuda|indemniz|expropiacion|petrol)/) },
  { id: "credito", etq: "Crédito o fuente de la imagen", ayuda: "¿De qué archivo viene?", cumple: (t) => tiene(t, /(fuente|archivo|fototeca|credito|foto:|autor|negativo|acervo)/) },
  { id: "aclara", etq: "Aclara el recorte o el error", ayuda: "Avisa que la versión viral estaba recortada o mal fechada.", cumple: (t) => tiene(t, /(recort|completa|original|contexto|no es de 2017|mal fechad)/) || tiene(t, corrige) },
  { id: "sinfalso", etq: "No repite la afirmación falsa", ayuda: "Si mencionas 2017 o el gasolinazo, que sea para desmentirlo.", cumple: (t) => !tiene(t, /(gasolinazo|2017)/) || tiene(t, corrige) },
  { id: "largo", etq: "Al menos 20 palabras", ayuda: "Explica con suficiente detalle.", cumple: (t) => normaliza(t).split(" ").filter(Boolean).length >= 20 },
];

/* ── Interpretación argumentada ─────────────────────────────────────────── */

export const PREGUNTA_INTERP = "¿Cómo reaccionó la sociedad mexicana ante la expropiación petrolera de 1938?";

export const TESIS: { id: string; texto: string; correcta: boolean; explica: string }[] = [
  { id: "dato", texto: "La expropiación petrolera se anunció el 18 de marzo de 1938.", correcta: false, explica: "Es un dato verificable, no una tesis: no interpreta ni responde a la pregunta." },
  { id: "tesis", texto: "La expropiación movilizó un apoyo popular amplio y diverso, aunque la prensa afín al gobierno exageró su unanimidad y parte de la movilización fue organizada.", correcta: true, explica: "Es una interpretación debatible, específica y sustentable con evidencias, que reconoce matices." },
  { id: "determinista", texto: "La expropiación era inevitable y todos los mexicanos, sin excepción, la apoyaron.", correcta: false, explica: "Cae en determinismo («inevitable») y en una generalización que ninguna fuente puede sostener («sin excepción»)." },
];

/** Peso de cada fuente como evidencia PARA ESTA PREGUNTA (0 = descartada). */
export const PESO_INTERP: Record<FuenteId, number> = { telegrama: 3, foto: 2, oral: 2, carta: 2, periodico: 1, boletin: 2, falsa: 0 };
export const PESO_MINIMO = 6;
export const MAX_SOSTIENEN = 3;

export const CONCLUSIONES: { id: string; texto: string; correcta: boolean; explica: string }[] = [
  { id: "matizada", texto: "Hubo un apoyo amplio y diverso; con estas fuentes no puede afirmarse que fuera unánime ni totalmente espontáneo.", correcta: true, explica: "Retoma la tesis, pesa las evidencias y reconoce el límite de lo que se sabe." },
  { id: "absoluta", texto: "Queda demostrado que todos los mexicanos apoyaron la expropiación.", correcta: false, explica: "Ninguna combinación de fuentes demuestra «todos»: es la exageración del diario oficialista." },
  { id: "relativista", texto: "Como las fuentes se contradicen, no se puede saber nada sobre la reacción.", correcta: false, explica: "Es relativismo: que haya matices no anula lo que varias fuentes independientes corroboran." },
];

export interface EvaluacionInterp {
  tesisOk: boolean;
  peso: number;
  tipos: number;
  descartadas: FuenteId[];
  contradictoras: FuenteId[];
  matizOk: boolean;
  conclusionOk: boolean;
  lista: boolean;
  mensajes: string[];
}

export function evaluarInterpretacion(tesis: string | null, sostienen: FuenteId[], matiz: FuenteId | null, conclusion: string | null): EvaluacionInterp {
  const mensajes: string[] = [];
  const t = TESIS.find((x) => x.id === tesis);
  const tesisOk = !!t?.correcta;
  if (t && !t.correcta) mensajes.push(t.explica);
  const descartadas = sostienen.filter((f) => PESO_INTERP[f] === 0);
  const contradictoras = sostienen.filter((f) => f === "boletin");
  const validas = sostienen.filter((f) => PESO_INTERP[f] > 0 && f !== "boletin");
  const peso = validas.reduce((a, f) => a + PESO_INTERP[f], 0);
  const tipos = new Set(validas.map((f) => FUENTE_DEF[f].tipo)).size;
  if (descartadas.length) mensajes.push("La carta del ingeniero tiene anacronismos: no puede sostener ninguna afirmación.");
  if (contradictoras.length) mensajes.push("El boletín de la compañía disputa la espontaneidad del apoyo: no sostiene la tesis, la matiza.");
  if (sostienen.includes("periodico")) mensajes.push("El diario oficialista pesa poco por su sesgo: sirve para el discurso oficial, no para medir el apoyo.");
  if (validas.length > 0 && peso < PESO_MINIMO) mensajes.push(`Tus evidencias pesan ${peso} de ${PESO_MINIMO}: suma fuentes más confiables para esta pregunta.`);
  if (validas.length > 1 && tipos < 2) mensajes.push("Usa al menos dos tipos distintos de fuente (corroboración cruzada).");
  const matizOk = matiz === "boletin" || matiz === "periodico";
  if (matiz && !matizOk) mensajes.push("Como matiz elige una fuente que ponga límites a la tesis: la compañía que habla de apoyo organizado o el diario que exagera.");
  const c = CONCLUSIONES.find((x) => x.id === conclusion);
  const conclusionOk = !!c?.correcta;
  if (c && !c.correcta) mensajes.push(c.explica);
  const lista = tesisOk && descartadas.length === 0 && contradictoras.length === 0 && peso >= PESO_MINIMO && tipos >= 2 && matizOk && conclusionOk;
  return { tesisOk, peso, tipos, descartadas, contradictoras, matizOk, conclusionOk, lista, mensajes };
}

/* ════════════════════════════════════════════════════════════════════════
 * Estrellas: ¿sirve como evidencia PARA ESTA pregunta?
 * ════════════════════════════════════════════════════════════════════════ */

export interface ItemConfiable {
  fuente: string;
  grupo: string;
  pregunta: string;
  sirve: boolean;
  porque: string;
}

export const ITEMS_CONFIABLE: ItemConfiable[] = [
  { grupo: "boletin", fuente: "Boletín de la compañía expropiada (Nueva York, 1938)", pregunta: "¿Qué argumentos usaron las compañías contra la expropiación?", sirve: true, porque: "Es la voz de las propias compañías: justo lo que se pregunta." },
  { grupo: "boletin", fuente: "Boletín de la compañía expropiada (Nueva York, 1938)", pregunta: "¿Siguieron funcionando las refinerías después del 18 de marzo?", sirve: false, porque: "Es parte interesada y escribe una predicción desde otro país." },
  { grupo: "periodico", fuente: "Nota del diario afín al gobierno (24 de marzo de 1938)", pregunta: "¿Cómo presentó la prensa afín al gobierno la expropiación?", sirve: true, porque: "Es un ejemplo directo de ese discurso." },
  { grupo: "periodico", fuente: "Nota del diario afín al gobierno (24 de marzo de 1938)", pregunta: "¿Qué proporción de la población apoyaba la medida?", sirve: false, porque: "Exagera («sin excepción») y no mide nada." },
  { grupo: "oral", fuente: "Testimonio oral grabado en 1988", pregunta: "¿Cómo vivió una familia de la capital la colecta de 1938?", sirve: true, porque: "Recupera la experiencia de alguien que no dejó documentos escritos." },
  { grupo: "oral", fuente: "Testimonio oral grabado en 1988", pregunta: "¿Qué día exacto y a qué hora se hizo la colecta?", sirve: false, porque: "Cincuenta años después la memoria es reconstructiva: para fechas precisas se buscan documentos de la época." },
  { grupo: "telegrama", fuente: "Telegrama confidencial de una legación (19 de marzo de 1938)", pregunta: "¿Cuándo y por qué medio se anunció la expropiación?", sirve: true, porque: "Lo escribió un observador externo a la mañana siguiente y en privado." },
  { grupo: "telegrama", fuente: "Telegrama confidencial de una legación (19 de marzo de 1938)", pregunta: "¿Qué sentían los obreros en las refinerías?", sirve: false, porque: "El diplomático estaba en la capital; no fue testigo de eso." },
  { grupo: "carta", fuente: "Carta del obrero de Minatitlán (20 de marzo de 1938)", pregunta: "¿Cómo recibieron la noticia en la refinería de Minatitlán?", sirve: true, porque: "Es un testigo directo, del lugar y de esos días." },
  { grupo: "carta", fuente: "Carta del obrero de Minatitlán (20 de marzo de 1938)", pregunta: "¿Qué pensaban los accionistas de las compañías?", sirve: false, porque: "Un obrero no tenía acceso a lo que pensaban los accionistas." },
];

/** Una ronda: tres fuentes, cada una con sus dos preguntas, en orden barajado. */
export function rondaConfiable(rnd: () => number): number[] {
  const grupos = baraja(["boletin", "periodico", "oral", "telegrama", "carta"], rnd).slice(0, 3);
  const idx = ITEMS_CONFIABLE.map((it, i) => ({ it, i })).filter((x) => grupos.includes(x.it.grupo)).map((x) => x.i);
  return baraja(idx, rnd);
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const PROGRESION =
  "Examina de manera crítica las evidencias y evalúa su validez, considerando los criterios de procedencia, intencionalidad y contexto, así como el uso ético de la información y los posicionamientos.";

export const TITULO_LECTURA = "Corroborar y criticar la evidencia histórica";

/**
 * Lectura del panel y marco teórico. Cada párrafo es VERBATIM de la
 * actividad indicada: CH-III-P02 no tiene lectura A1 (su A1 es un video), así
 * que se arma con las explicaciones de sus propias actividades y dos textos de
 * las progresiones 3 y 4.
 */
export const LECTURA: { texto: string; fuente: string }[] = [
  {
    texto: "Procedimiento metodológico que consiste en contrastar una fuente con otras evidencias independientes para verificar, matizar o refutar la información que contiene. Elemento central del método histórico crítico.",
    fuente: "Glosario A5 · Corroboración de fuentes",
  },
  {
    texto: "La triangulación no se refiere a un número fijo de fuentes ni a fuentes del mismo tipo. Consiste en contrastar fuentes de distintos tipos (documentos escritos, fuentes iconográficas, testimonios orales) y de distintos actores o perspectivas para obtener una imagen más completa y confiable de un evento. El objetivo es identificar convergencias (datos que múltiples fuentes independientes confirman) y divergencias (contradicciones que requieren análisis crítico adicional).",
    fuente: "Quiz A2",
  },
  {
    texto: "El archivo Casasola (producido durante y después de la Revolución Mexicana por la familia fotográfica Casasola) es una fuente iconográfica primaria de enorme valor. Sin embargo, toda fotografía es una selección: el fotógrafo decide qué encuadrar y qué excluir, desde qué ángulo, para qué audiencia. Analizar críticamente estas fotografías implica preguntarse también qué imagen de la Revolución construyó ese archivo y qué perspectivas o grupos quedaron fuera.",
    fuente: "Quiz A2 · archivo Casasola",
  },
  {
    texto: "El sesgo de supervivencia señala precisamente lo contrario: las fuentes que llegaron hasta nosotros no son representativas de todo lo que existió. Sobreviven preferentemente los documentos de élites, del Estado y de instituciones que tenían recursos para preservarlos. Las voces de grupos populares, mujeres, indígenas y comunidades sin escritura están subrepresentadas.",
    fuente: "Quiz A2 · sesgo de supervivencia",
  },
  {
    texto: "La corroboración es un principio metodológico general, no una medida de emergencia solo para fuentes sospechosas. Toda interpretación histórica sólida se apoya en evidencias corroboradas por múltiples fuentes independientes, independientemente de que parezcan confiables. Incluso las fuentes más creíbles pueden contener errores, perspectivas parciales o información incompleta que otras fuentes ayudan a completar o corregir.",
    fuente: "Quiz A2",
  },
  {
    texto: "Tres errores frecuentes que debilitan la narrativa histórica argumentada son el anacronismo (atribuir a actores del pasado ideas o intenciones que no podían tener en su época), el presentismo (juzgar el pasado con los valores del presente sin considerar el contexto) y el determinismo (presentar los eventos históricos como inevitables, como si no hubieran podido ocurrir de otra manera).",
    fuente: "CH-III-P03-A1 · lectura",
  },
  {
    texto: "Historia en redes sociales: formatos cortos (hilo de Twitter, carrusel de Instagram, TikTok) alcanzan audiencias masivas de jóvenes. El riesgo: simplificación excesiva, descontextualización y viralización de errores históricos.",
    fuente: "CH-III-P04-A1 · infografía",
  },
  {
    texto: "Criterio común a todos los formatos: veracidad verificable. Independientemente del formato, el comunicador histórico tiene la responsabilidad de citar sus fuentes, distinguir entre hechos e interpretaciones y no alterar evidencias.",
    fuente: "CH-III-P04-A1 · infografía",
  },
];

/** Pregunta de reflexión de la autoevaluación A7 — verbatim. */
export const REFLEXION_A7 =
  "¿Por qué crees que en la actualidad la corroboración de fuentes es una habilidad valiosa no solo para historiadores sino para cualquier ciudadano? Relaciona el método histórico con la verificación de noticias o información en redes sociales.";

/** Hechos: quiz A2 (verdadero/falso), los reactivos que no están en el reto. */
export const HECHOS: string[] = [
  "Verdadero: «Los testimonios orales recopilados por el INAH y otras instituciones son fuentes históricas válidas que pueden someterse a análisis crítico igual que las fuentes escritas». Se analizan aplicando criterios similares: ¿quién testifica, cuándo lo hace (distancia temporal del evento), cuál es su posición y perspectiva, qué puede recordar con precisión?",
  "Falso: «Para estudiar la masacre de Tlatelolco del 2 de octubre de 1968, bastaría con usar los comunicados oficiales del gobierno de Díaz Ordaz sin necesidad de contrastarlos con otras fuentes». Los comunicados oficiales del gobierno de 1968 son una fuente primaria útil, pero tienen un sesgo evidente: el gobierno negó la masacre y minimizó los hechos para proteger su imagen.",
  "Verdadero: «La Hemeroteca Nacional Digital de México (HNDM) permite acceder en línea a periódicos históricos del siglo XIX y XX, que constituyen fuentes primarias para investigar la historia de México». Son especialmente útiles para corroborar datos, contrastar perspectivas y estudiar cómo fue percibido un evento contemporáneamente.",
  "Falso: «La corroboración de fuentes solo es necesaria cuando el historiador sospecha que una fuente es falsa o está manipulada». La corroboración es un principio metodológico general, no una medida de emergencia solo para fuentes sospechosas.",
];

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Corroboración de fuentes", definicion: "Procedimiento metodológico que consiste en contrastar una fuente con otras evidencias independientes para verificar, matizar o refutar la información que contiene. Elemento central del método histórico crítico.", ejemplo: "Para corroborar la fecha de un decreto colonial, el historiador busca registros notariales, cartas de la época y actas del cabildo que confirmen o contradigan esa fecha." },
  { termino: "Evidencia histórica", definicion: "Todo vestigio del pasado — objeto, documento, imagen, tradición oral — que puede ser analizado críticamente para sustentar afirmaciones sobre hechos históricos. No toda evidencia tiene el mismo peso.", ejemplo: "Una moneda acuñada en el siglo XVI es evidencia histórica del sistema económico colonial; un relato oral transcrito en el siglo XX es evidencia secundaria de menor inmediatez." },
  { termino: "Análisis documental", definicion: "Técnica sistemática de examen de un documento histórico que considera: autoría, fecha, destinatario, propósito, contexto de producción, lenguaje utilizado y circulación del documento.", ejemplo: "Analizar el Acta de Independencia de México (1821) implica examinar quiénes la firmaron, en qué contexto político fue redactada, qué términos usaron y qué intereses representaba." },
  { termino: "Corroboración cruzada (cross-checking)", definicion: "Comparación de fuentes de tipos distintos (escritas, orales, iconográficas, arqueológicas) sobre el mismo hecho. Cuando coinciden, fortalece la interpretación; cuando divergen, señala aspectos a profundizar.", ejemplo: "Cruzar el relato de un testigo oral con un periódico de la época y una fotografía del evento proporciona una imagen más completa y menos sesgada." },
  { termino: "Validación de evidencias", definicion: "Proceso por el cual el historiador decide si una evidencia es suficientemente sólida para sustentar una afirmación histórica. Implica evaluar su autenticidad, relevancia y consistencia con otras evidencias.", ejemplo: "Antes de citar un documento como prueba, el historiador verifica que no sea una falsificación, que su fecha sea coherente con el hecho descrito y que otros documentos lo respalden." },
  { termino: "Suspensión del juicio historiográfico", definicion: "Práctica metodológica que consiste en abstenerse de emitir una conclusión cuando las evidencias son insuficientes o contradictorias, reconociendo explícitamente la incertidumbre histórica.", ejemplo: "Si dos crónicas de la época dan fechas distintas para una batalla y no hay documentación adicional, el historiador registra la discrepancia sin elegir arbitrariamente una fecha." },
];

export const ACTIVIDAD_A5 =
  "Selecciona un hecho histórico de tu interés. Busca o imagina dos fuentes distintas (por ejemplo, un periódico de la época y un testimonio oral). Aplica el procedimiento de corroboración: ¿en qué coinciden? ¿en qué divergen? ¿qué tipo de fuente adicional necesitarías para validar la evidencia?";

/** Debate A3 — verbatim (tema, posturas y argumentos guía). */
export const DEBATE_A3 = {
  tema: "¿Los testimonios orales de testigos directos tienen la misma validez histórica que los documentos escritos de la época?",
  posturas: [
    {
      postura: "Los testimonios orales son fuentes históricas igualmente válidas que los documentos escritos",
      argumentos: [
        "Los testimonios orales recuperan experiencias de grupos que no dejaron registros escritos: comunidades indígenas, mujeres, campesinos y trabajadores cuyas voces no aparecen en los documentos oficiales del AGN o los periódicos de la época. El Proyecto de Historia Oral del INAH ha recogido miles de testimonios que son fuentes históricas únicas.",
        "La historia oral tiene metodologías propias de verificación: los historiadores que trabajan con testimonios orales aplican criterios de análisis crítico (consistencia interna, corroboración con otras fuentes, distancia temporal) que permiten evaluar su confiabilidad igual que se haría con un documento escrito.",
      ],
    },
    {
      postura: "Los documentos escritos son fuentes más confiables que los testimonios orales",
      argumentos: [
        "La memoria humana es reconstructiva y selectiva: estudios de psicología cognitiva demuestran que los recuerdos se modifican con el tiempo, incorporan información posterior y están influenciados por las memorias colectivas del grupo. Un testigo puede recordar con convicción algo que en realidad no ocurrió exactamente así o que fue influenciado por lo que otros relataron después.",
        "Los documentos escritos permiten establecer cronologías más precisas: saber exactamente cuándo se produjo un documento (por fecha, lugar y firma) ayuda a reconstruir la secuencia de los eventos con mayor precisión que un testimonio cuya fecha exacta es difícil de verificar.",
      ],
    },
  ],
};

export const FUENTE =
  "CEN Bachillerato — Conciencia Histórica III, progresión 2: video con preguntas A1, quiz A2, debate A3, quiz A4, glosario A5, texto A6 y autoevaluación A7; lectura CH-III-P03-A1 e infografía CH-III-P04-A1.";

export const PROBLEMA =
  "Un expediente sobre la expropiación petrolera de 1938 llega a tu mesa: una carta, un diario, un boletín, un telegrama, una foto, un testimonio… y una fuente que no debería existir. ¿Qué te dice cada documento, a quién le hablaba y para qué? ¿Qué afirmaciones resisten la corroboración? ¿Y cómo se usa una foto histórica sin engañar a nadie?";

export const INSTRUCCIONES: string[] = [
  "En Ficha de procedencia, examina cada documento con la lupa (voltéalo para ver el reverso) y llena su ficha: autor, fecha y lugar, destinatario, intención y cercanía al hecho.",
  "En Corroborar, elige una afirmación y tiende hilos verdes (corrobora) o rojos (contradice) desde cada fuente del tablero; luego da tu dictamen. Revisa con la lupa la carta del ingeniero y encuentra lo imposible para 1938.",
  "En Uso ético e interpretación, detecta qué está mal en la publicación, quita el recorte, voltea la foto y reescribe la publicación con contexto y crédito. Después arma tu interpretación con evidencias de peso.",
  "Gana estrellas decidiendo si una fuente sirve para una pregunta concreta y resuelve el reto A1–A4 y el texto A6.",
];

export const IDEAS: string[] = [
  "Procedencia: quién produjo la fuente, cuándo, dónde y qué tan cerca estuvo del hecho.",
  "Intencionalidad: para quién y para qué se escribió; una fuente con intención no es inútil, pero hay que leerla con ella en mente.",
  "La fecha en que un documento llega al archivo no es la fecha en que se escribió.",
  "Corroborar es contrastar con fuentes independientes y de tipos distintos; cuando no alcanza, se suspende el juicio.",
  "Un anacronismo —una palabra, objeto o institución imposible para la fecha— delata una fuente falsa o mal fechada.",
  "La misma fuente puede ser confiable para una pregunta y no para otra.",
  "Usar con ética una imagen histórica es darle su contexto, su fecha y su crédito, sin recortes que cambien su sentido.",
];

/* ── Reto evaluable: A1 (video con preguntas) + A4 (verdadero/falso) ─────── */

const VF = ["Verdadero", "Falso"];

/**
 * Los cuatro reactivos del video A1 son verbatim. A1 no trae
 * retroalimentación: se usa la del reactivo equivalente del quiz A2 (verbatim,
 * sin la palabra inicial «Correcto»/«Falso») o la definición del glosario A5.
 * Los cinco reactivos de A4 son verbatim con su retroalimentación; el mínimo
 * aprobatorio (70 %) es el de A4.
 */
export const QUIZ: QuizEvaluable = {
  titulo: "Corroboración de fuentes (A1 y A4)",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Qué es la corroboración de fuentes en la investigación histórica y por qué es indispensable para construir argumentos sólidos?",
      opciones: ["Copiar una fuente para confirmar que existe en otro archivo", "Contrastar múltiples fuentes independientes para verificar si una información se sostiene o debe revisarse", "Citar a otros historiadores que usaron la misma fuente", "Digitalizar documentos para preservarlos"],
      respuestaCorrecta: 1,
      retroalimentacion: "Procedimiento metodológico que consiste en contrastar una fuente con otras evidencias independientes para verificar, matizar o refutar la información que contiene. Elemento central del método histórico crítico.",
    },
    {
      enunciado: "¿Cómo funciona la triangulación de fuentes y qué tipos de fuentes combina el historiador para aplicarla en el estudio de la historia de México?",
      opciones: ["Solo usa tres fuentes del mismo tipo para confirmar una fecha", "Combina fuentes de distintos tipos (documentos escritos, fuentes iconográficas, testimonios orales) y de distintos actores para obtener una imagen más completa y contrastada de un evento", "Traza triángulos en mapas históricos para ubicar eventos", "Usa solo fuentes primarias y descarta las secundarias"],
      respuestaCorrecta: 1,
      retroalimentacion: "La triangulación no se refiere a un número fijo de fuentes ni a fuentes del mismo tipo. Consiste en contrastar fuentes de distintos tipos (documentos escritos, fuentes iconográficas, testimonios orales) y de distintos actores o perspectivas para obtener una imagen más completa y confiable de un evento.",
    },
    {
      enunciado: "¿Cómo se lee críticamente una imagen histórica —como una fotografía de la Revolución Mexicana o una pintura del muralismo— para extraer evidencia histórica rigurosa?",
      opciones: ["Se describe lo que se ve sin hacer ninguna interpretación", "Se analiza el contexto de producción (quién la hizo, cuándo, para quién), se identifican los elementos representados y sus connotaciones, y se contrasta con otras fuentes para verificar su información", "Se busca si es bonita o fea y se decide si es importante", "Se compara solo con otras imágenes del mismo autor"],
      respuestaCorrecta: 1,
      retroalimentacion: "El archivo Casasola (producido durante y después de la Revolución Mexicana por la familia fotográfica Casasola) es una fuente iconográfica primaria de enorme valor. Sin embargo, toda fotografía es una selección: el fotógrafo decide qué encuadrar y qué excluir, desde qué ángulo, para qué audiencia. Analizar críticamente estas fotografías implica preguntarse también qué imagen de la Revolución construyó ese archivo y qué perspectivas o grupos quedaron fuera.",
    },
    {
      enunciado: "¿Qué es el sesgo de supervivencia en las fuentes históricas y cómo distorsiona la imagen del pasado si no se toma en cuenta?",
      opciones: ["El hecho de que solo sobreviven los historiadores que escriben sobre el pasado", "La tendencia a conocer el pasado solo a través de las fuentes que sobrevivieron al tiempo, ignorando que la mayoría de la evidencia histórica se ha perdido y que lo que sobrevivió no es representativo de todo lo que existió", "El sesgo de los historiadores que sobrevivieron a una guerra y escribieron sobre ella", "El privilegio de las fuentes más antiguas sobre las más recientes"],
      respuestaCorrecta: 1,
      retroalimentacion: "El sesgo de supervivencia señala precisamente lo contrario: las fuentes que llegaron hasta nosotros no son representativas de todo lo que existió. Sobreviven preferentemente los documentos de élites, del Estado y de instituciones que tenían recursos para preservarlos. Las voces de grupos populares, mujeres, indígenas y comunidades sin escritura están subrepresentadas. La quema de códices mesoamericanos durante la Conquista es un ejemplo extremo de este sesgo: una parte enorme de la historia prehispánica fue destruida.",
    },
    {
      enunciado: "Verdadero o falso: La corroboración de fuentes consiste en buscar otros documentos o testimonios que confirmen, maticen o contradigan la información de una fuente inicial.",
      opciones: VF,
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto. Corroborar significa buscar evidencias adicionales que respalden, complementen o pongan en duda lo afirmado por una fuente. Es el paso que sigue a la lectura crítica de la fuente.",
    },
    {
      enunciado: "Verdadero o falso: Una evidencia histórica queda validada con una sola fuente si esta es muy detallada y está bien redactada.",
      opciones: VF,
      respuestaCorrecta: 1,
      retroalimentacion: "Falso. El rigor historiográfico exige corroborar la evidencia con múltiples fuentes independientes. La calidad de la redacción no garantiza la veracidad del contenido.",
    },
    {
      enunciado: "Verdadero o falso: El análisis documental es una técnica que permite examinar la estructura, el lenguaje, el contexto de producción y la intención de un documento histórico.",
      opciones: VF,
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto. El análisis documental es una metodología sistemática que va más allá del contenido literal: examina quién escribió el documento, para quién, cuándo, con qué propósito y cómo circuló.",
    },
    {
      enunciado: "Verdadero o falso: Si dos fuentes contradicen la misma afirmación, el historiador debe elegir la más antigua y descarta la más reciente.",
      opciones: VF,
      respuestaCorrecta: 1,
      retroalimentacion: "Falso. La antigüedad de una fuente no la hace automáticamente más válida. El historiador pondera la fiabilidad, el contexto y la perspectiva de cada fuente, y puede suspender el juicio si la evidencia es insuficiente.",
    },
    {
      enunciado: "Verdadero o falso: La corroboración cruzada (cross-checking) entre fuentes de diferentes tipos — oral, escrita, iconográfica — fortalece la validez de una interpretación histórica.",
      opciones: VF,
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto. Cuando fuentes de distintos tipos y orígenes coinciden en un hecho, la interpretación gana solidez. La diversidad de tipos de fuentes reduce el riesgo de sesgo sistemático.",
    },
  ],
};

/** Actividad A6 «Completa los espacios — Corroboración y validación de evidencias históricas» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "CH-III-P02-A6 · Completa los espacios — Corroboración y validación de evidencias históricas",
  instrucciones: "Completa los huecos con el término o concepto correcto.",
  partes: [
    "El procedimiento que consiste en buscar otras fuentes independientes para verificar o refutar la información de una fuente se llama ",
    " de fuentes. Cuando el historiador no tiene evidencia suficiente para afirmar un hecho, debe practicar la ",
    " del juicio. El examen sistemático de un documento considerando su autor, fecha, propósito y contexto se llama análisis ",
    ". La comparación de fuentes de distintos tipos (oral, escrita, iconográfica) se conoce como corroboración ",
    ".",
  ],
  huecos: [
    { respuesta: "corroboración", alternativas: ["contraste"], pista: "El método de verificar una fuente con otras evidencias independientes se llama ___ de fuentes." },
    { respuesta: "suspensión", alternativas: [], pista: "Cuando la evidencia es insuficiente, el historiador practica la ___ del juicio historiográfico." },
    { respuesta: "documental", alternativas: [], pista: "El examen sistemático de un documento histórico se llama análisis ___." },
    { respuesta: "cruzada", alternativas: ["cross-checking"], pista: "Cuando se comparan fuentes de tipos distintos, hablamos de corroboración ___." },
  ],
};
