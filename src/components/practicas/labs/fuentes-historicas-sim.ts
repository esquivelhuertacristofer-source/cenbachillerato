/**
 * Modelo del SIMULADOR «Archivo de fuentes» (lab «fuentes-historicas»).
 *
 * TODO es ficticio: Villa Alameda, la hacienda, el periódico «El Eco del Valle»
 * y las personas son inventados para aprender a evaluar fuentes. Los años y
 * los textos son de simulación, no registran ningún hecho real.
 *
 * El modelo es DETERMINISTA y transparente:
 *   · cada fuente afirma ciertas versiones de los hechos (`claims`);
 *   · el alumno juzga qué tan fiable es cada fuente y esa confianza pesa
 *     (confiable 2 · con reservas 1 · poco confiable 0) en la línea de tiempo;
 *   · una fuente que deriva de otra (copia) no suma su voto si la original
 *     ya está contando, porque no es evidencia independiente.
 */

export type TipoFuente = "primaria" | "secundaria" | "terciaria";
export type Fiab = "alta" | "media" | "baja";
export type Juicio = "confiable" | "reservas" | "poco";
export type CriterioId = "autoria" | "fecha" | "intencion" | "audiencia" | "contexto";
export type EventoId = "ev1" | "ev2" | "ev3" | "ev4" | "ev5";

/** Horas de archivo (simulación) que se pueden gastar en pistas. */
export const HORAS = 14;
export const COSTO_PISTA = 1;
export const COSTO_CONTRASTE = 2;
/** Fuentes que hay que juzgar como mínimo para poder cerrar el caso. */
export const MIN_PARA_CERRAR = 5;

export const CRITERIOS_SIM: { id: CriterioId; etiqueta: string; pregunta: string; icono: string }[] = [
  { id: "autoria", etiqueta: "Autoría", pregunta: "¿Quién produjo la fuente?", icono: "fa-user-pen" },
  { id: "fecha", etiqueta: "Fecha", pregunta: "¿Cuándo se produjo?", icono: "fa-calendar-days" },
  { id: "intencion", etiqueta: "Intención", pregunta: "¿Para qué se produjo?", icono: "fa-bullseye" },
  { id: "audiencia", etiqueta: "Audiencia", pregunta: "¿Para quién estaba destinada?", icono: "fa-users" },
  { id: "contexto", etiqueta: "Contexto", pregunta: "¿En qué circunstancias se produjo?", icono: "fa-landmark" },
];

export interface Claim {
  ev: EventoId;
  /** «a» es lo que realmente ocurrió; «b» es la versión alterna (sesgo, olvido). */
  v: "a" | "b";
}

export interface FuenteSim {
  id: string;
  /** Clave de la imagen: /media/labs-sim/fuentes-historicas/<clave>.webp */
  clave: string;
  medio: string;
  icono: string;
  titulo: string;
  /** Lo que la fuente dice o muestra, a la vista desde el inicio. */
  resumen: string;
  pistas: Record<CriterioId, string>;
  claims: Claim[];
  tipo: TipoFuente;
  fiab: Fiab;
  razonTipo: string;
  razonFiab: string;
  /** Si copia a otra fuente, su id. */
  deriva?: string;
}

export const ARCHIVO: FuenteSim[] = [
  {
    id: "carta",
    clave: "carta",
    medio: "Carta",
    icono: "fa-envelope-open-text",
    titulo: "Carta de una maestra a su hermana",
    resumen: "Escrita al día siguiente de la crecida. Cuenta que oyó rechinar la compuerta de la hacienda en plena noche y que el agua entró al barrio con la luz del amanecer.",
    pistas: {
      autoria: "Maestra de la escuela del barrio bajo. Vivió la crecida, pero la cuenta desde su casa.",
      fecha: "La escribió el día 4, un día después. El recuerdo está fresco.",
      intencion: "Desahogarse con su familia. No busca convencer a nadie.",
      audiencia: "Solo su hermana. No pensaba publicarla, así que no tiene por qué adornar.",
      contexto: "Habla desde el barrio que quedó bajo el agua: ve lo suyo, no lo que pasó dentro de la hacienda.",
    },
    claims: [{ ev: "ev1", v: "a" }, { ev: "ev3", v: "a" }, { ev: "ev4", v: "a" }],
    tipo: "primaria",
    fiab: "alta",
    razonTipo: "Nació en el momento de los hechos y la escribió una testigo directa: es evidencia de primera mano.",
    razonFiab: "Es cercana en el tiempo, sin intención de propaganda y coincide con el objeto y la fotografía. Su límite: solo cuenta lo que vio desde el barrio.",
  },
  {
    id: "foto",
    clave: "foto",
    medio: "Fotografía",
    icono: "fa-camera",
    titulo: "Fotografía de la calle del barrio bajo",
    resumen: "Calle con una marca de lodo a la altura de las ventanas y vecinos sacando muebles. No trae pie de foto.",
    pistas: {
      autoria: "Un fotógrafo ambulante del valle. No firmó la imagen.",
      fecha: "Sin fecha escrita. El lodo fresco indica que es de pocos días después de la crecida.",
      intencion: "Vendía copias como recuerdo del desastre: mostrar lo ocurrido era su negocio.",
      audiencia: "El público del valle, que quería ver cómo quedó el barrio.",
      contexto: "Es una escena de DESPUÉS de la inundación: muestra el daño, no explica por qué ocurrió.",
    },
    claims: [{ ev: "ev5", v: "a" }],
    tipo: "primaria",
    fiab: "alta",
    razonTipo: "Es una fuente iconográfica de la época: una imagen producida durante el período estudiado.",
    razonFiab: "Registra directamente el nivel del agua y no tiene motivo para exagerarlo. Como toda imagen, solo prueba lo que muestra, no las causas.",
  },
  {
    id: "periodico",
    clave: "periodico",
    medio: "Periódico",
    icono: "fa-newspaper",
    titulo: "Nota de «El Eco del Valle»",
    resumen: "Asegura que la crecida fue «imprevisible», que la compuerta cedió sola por la fuerza del agua y que los daños fueron menores.",
    pistas: {
      autoria: "Sin firma: es la línea del diario, propiedad de un socio del dueño de la hacienda.",
      fecha: "Salió tres días después, cuando ya circulaban rumores y reclamos.",
      intencion: "Calmar a los vecinos y proteger la reputación de la presidencia municipal y de la hacienda.",
      audiencia: "Lectores del valle, incluidas autoridades y propietarios.",
      contexto: "Se imprimía con permiso de la presidencia y vivía de sus anuncios.",
    },
    claims: [{ ev: "ev1", v: "a" }, { ev: "ev2", v: "b" }, { ev: "ev3", v: "b" }, { ev: "ev5", v: "b" }],
    tipo: "primaria",
    fiab: "baja",
    razonTipo: "Se publicó en la época de los hechos: es producto del período, aunque no sea neutral.",
    razonFiab: "Tiene un sesgo fuerte: quien lo sostiene se beneficia de esa versión y contradice a la fotografía, la carta y el objeto. Sirve para conocer la versión oficial, no para reconstruir los hechos.",
  },
  {
    id: "objeto",
    clave: "objeto",
    medio: "Objeto",
    icono: "fa-link",
    titulo: "Cadena de la compuerta, museo comunitario",
    resumen: "Cadena gruesa con un eslabón cortado limpio, con marcas de cizalla. Se conserva en el museo del pueblo.",
    pistas: {
      autoria: "La forjó un herrero local. Quién la cortó se desconoce.",
      fecha: "El museo la recibió en 1910 (simulación); el óxido y el lodo seco coinciden con esos años.",
      intencion: "No se hizo para contar nada: es un objeto de uso, no intenta convencer a nadie.",
      audiencia: "Ninguna: no fue creada para ser leída ni vista.",
      contexto: "Pertenecía a la compuerta de la hacienda. Un eslabón roto por el agua se vería desgarrado; este está cortado limpio.",
    },
    claims: [{ ev: "ev3", v: "a" }],
    tipo: "primaria",
    fiab: "alta",
    razonTipo: "Es un objeto material de la época: un vestigio directo de los hechos.",
    razonFiab: "Un objeto no opina, pero hay que interpretarlo. Su valor sube porque coincide con la carta: dos fuentes independientes apuntan a lo mismo.",
  },
  {
    id: "testimonio",
    clave: "testimonio",
    medio: "Testimonio grabado",
    icono: "fa-microphone",
    titulo: "Entrevista de 1978 a un vecino",
    resumen: "Recuerda las campanas de aviso y que la gente ya sabía que el río subía. Ubica la llegada del agua «a medianoche».",
    pistas: {
      autoria: "Un vecino que tenía 8 años en la crecida: la vio con ojos de niño.",
      fecha: "Grabada en 1978, setenta y un años después. La memoria se acomoda con el tiempo.",
      intencion: "Contaba lo que recordaba para un archivo de historia oral; no tenía motivo para ocultar nada.",
      audiencia: "La investigadora y el archivo de historia oral.",
      contexto: "Mezcla lo que vio con lo que le contaron los mayores después.",
    },
    claims: [{ ev: "ev1", v: "a" }, { ev: "ev2", v: "a" }, { ev: "ev4", v: "b" }],
    tipo: "primaria",
    fiab: "media",
    razonTipo: "Es un testimonio oral de un testigo directo: fuente primaria, aunque recogida mucho después.",
    razonFiab: "Es honesto, pero la distancia en el tiempo falla en detalles como la hora (la carta, escrita al día siguiente, dice amanecer). Útil con reservas.",
  },
  {
    id: "libro",
    clave: "libro",
    medio: "Libro",
    icono: "fa-book",
    titulo: "«Aguas y poder en el Valle» (2015)",
    resumen: "Un historiador reconstruye la crecida con cartas, objetos y actas. Concluye que se abrió la compuerta de noche y que los avisos fueron ignorados.",
    pistas: {
      autoria: "Historiador profesional (ficticio), con obra publicada y revisión de colegas.",
      fecha: "2015: más de un siglo después. No vio los hechos, los interpreta.",
      intencion: "Explicar el caso con argumentos; también defiende una tesis sobre quién tuvo la culpa.",
      audiencia: "Lectores académicos y estudiantes.",
      contexto: "Trabajó con archivos que hoy se pueden consultar y sin la presión política de la época.",
    },
    claims: [{ ev: "ev1", v: "a" }, { ev: "ev2", v: "a" }, { ev: "ev3", v: "a" }],
    tipo: "secundaria",
    fiab: "alta",
    razonTipo: "Es una interpretación elaborada después por un historiador a partir de fuentes primarias.",
    razonFiab: "Su valor viene de las fuentes primarias que cita y de que se puede revisar su bibliografía. Aun así es una tesis: conviene contrastarla.",
  },
  {
    id: "articulo",
    clave: "articulo",
    medio: "Artículo de divulgación",
    icono: "fa-file-lines",
    titulo: "Artículo de revista cultural (2019)",
    resumen: "Resume el caso en una página: la compuerta se abrió de noche y se ignoraron los avisos.",
    pistas: {
      autoria: "Periodista cultural. No investigó en archivos.",
      fecha: "2019, cuatro años después del libro.",
      intencion: "Divulgar de forma amena, no aportar hallazgos nuevos.",
      audiencia: "Público general de una revista.",
      contexto: "Cita como única fuente el libro de 2015 y repite casi igual sus frases.",
    },
    claims: [{ ev: "ev2", v: "a" }, { ev: "ev3", v: "a" }],
    tipo: "secundaria",
    fiab: "media",
    razonTipo: "Resume e interpreta lo ya escrito sobre el tema: es secundaria.",
    razonFiab: "Lo que dice es correcto, pero copia al libro: no es una prueba independiente. Contarlo como segunda fuente sería inflar la evidencia.",
    deriva: "libro",
  },
  {
    id: "catalogo",
    clave: "catalogo",
    medio: "Catálogo bibliográfico",
    icono: "fa-database",
    titulo: "Catálogo de obras sobre el Valle",
    resumen: "Lista 40 libros, artículos y archivos sobre el Valle, ordenados por tema. No cuenta qué pasó.",
    pistas: {
      autoria: "Bibliotecarios que ordenan fichas.",
      fecha: "Actualizado en 2021.",
      intencion: "Ayudar a encontrar materiales, no interpretar los hechos.",
      audiencia: "Quien investiga.",
      contexto: "Reúne obras secundarias y fichas de archivos: no es evidencia por sí mismo.",
    },
    claims: [],
    tipo: "terciaria",
    fiab: "media",
    razonTipo: "Recopila y organiza fuentes secundarias: es una fuente terciaria.",
    razonFiab: "No aporta evidencia propia sobre el caso; orienta hacia dónde buscar. Úsalo con reservas, como brújula y no como prueba.",
  },
];

export interface EventoSim {
  id: EventoId;
  titulo: string;
  a: string;
  b: string | null;
  /** Qué ocurrió de verdad y por qué (para el veredicto). */
  porque: string;
}

export const EVENTOS: EventoSim[] = [
  { id: "ev1", titulo: "Lluvia en la sierra", a: "Llovió tres días sin parar en la sierra.", b: null, porque: "Todas las fuentes que lo mencionan coinciden: es el hecho mejor corroborado." },
  { id: "ev2", titulo: "Aviso del río", a: "El aviso de que el río crecía llegó a la presidencia, pero nadie actuó.", b: "No hubo forma de avisar a tiempo.", porque: "El testimonio y el libro hablan de avisos; solo el periódico oficial lo niega, y le conviene negarlo." },
  { id: "ev3", titulo: "La compuerta de la hacienda", a: "De noche abrieron la compuerta de la hacienda.", b: "La compuerta cedió sola por la fuerza del agua.", porque: "La carta y la cadena cortada limpio coinciden; el periódico, interesado, dice lo contrario." },
  { id: "ev4", titulo: "Llegada del agua", a: "El agua entró al barrio bajo al amanecer.", b: "El agua entró al barrio bajo a medianoche.", porque: "La carta se escribió al día siguiente; el testimonio, 71 años después. Entre dos primarias gana la más cercana." },
  { id: "ev5", titulo: "Los daños", a: "El barrio bajo quedó anegado hasta las ventanas.", b: "Los daños fueron menores.", porque: "La fotografía muestra el daño; el periódico lo minimiza para proteger a la autoridad." },
];

export const PESO: Record<Juicio, number> = { confiable: 2, reservas: 1, poco: 0 };

export const JUICIO_DE: Record<Fiab, Juicio> = { alta: "confiable", media: "reservas", baja: "poco" };

export const ETIQUETA_JUICIO: Record<Juicio, string> = {
  confiable: "Confiable",
  reservas: "Con reservas",
  poco: "Poco confiable",
};

export type Valoracion = "exacto" | "casi" | "error";

/** Compara el juicio del alumno con el real: lo adyacente es «casi», no error. */
export function valorar(f: FuenteSim, j: Juicio): Valoracion {
  const real = JUICIO_DE[f.fiab];
  if (j === real) return "exacto";
  if (j === "reservas" || real === "reservas") return "casi";
  return "error";
}

export function porId(id: string): FuenteSim {
  return ARCHIVO.find((f) => f.id === id)!;
}

/** Qué dicen dos fuentes entre sí, calculado a partir de sus afirmaciones. */
export function contrastar(aId: string, bId: string): { coinciden: string[]; contradicen: string[]; sinComun: boolean; derivada: boolean } {
  const a = porId(aId);
  const b = porId(bId);
  const coinciden: string[] = [];
  const contradicen: string[] = [];
  for (const ca of a.claims) {
    const cb = b.claims.find((c) => c.ev === ca.ev);
    if (!cb) continue;
    const tit = EVENTOS.find((e) => e.id === ca.ev)!.titulo;
    if (cb.v === ca.v) coinciden.push(tit);
    else contradicen.push(tit);
  }
  return { coinciden, contradicen, sinComun: coinciden.length + contradicen.length === 0, derivada: a.deriva === b.id || b.deriva === a.id };
}

export function textoContraste(aId: string, bId: string): string {
  const c = contrastar(aId, bId);
  const partes: string[] = [];
  if (c.derivada) partes.push("Una repite a la otra casi palabra por palabra: no son pruebas independientes.");
  if (c.coinciden.length) partes.push(`Coinciden en: ${c.coinciden.join(", ")}.`);
  if (c.contradicen.length) partes.push(`Se contradicen en: ${c.contradicen.join(", ")}. Hay que decidir a cuál creerle y por qué.`);
  if (c.sinComun) partes.push("No hablan de los mismos hechos: no se pueden contrastar entre sí.");
  return partes.join(" ");
}

export interface JuiciosEstado {
  [fuenteId: string]: Juicio | undefined;
}

export type EstadoEvento = "sin" | "una" | "corroborada" | "disputa";

export interface LineaEvento {
  ev: EventoSim;
  estado: EstadoEvento;
  /** Versión que la línea muestra (la que más pesa). */
  version: "a" | "b" | null;
  pesoA: number;
  pesoB: number;
  apoyos: number;
  correcto: boolean;
}

/** Línea de tiempo reconstruida con los juicios actuales del alumno. */
export function lineaDeTiempo(juicios: JuiciosEstado): LineaEvento[] {
  // Una fuente derivada no suma si su original ya cuenta (peso > 0).
  const cuenta = (f: FuenteSim): number => {
    const j = juicios[f.id];
    if (!j) return 0;
    const w = PESO[j];
    if (f.deriva && (juicios[f.deriva] ? PESO[juicios[f.deriva]!] : 0) > 0) return 0;
    return w;
  };
  return EVENTOS.map((ev) => {
    let pesoA = 0;
    let pesoB = 0;
    let apoyosA = 0;
    let apoyosB = 0;
    for (const f of ARCHIVO) {
      const c = f.claims.find((x) => x.ev === ev.id);
      if (!c) continue;
      const w = cuenta(f);
      if (w <= 0) continue;
      if (c.v === "a") {
        pesoA += w;
        apoyosA += 1;
      } else {
        pesoB += w;
        apoyosB += 1;
      }
    }
    const version: "a" | "b" | null = pesoA === 0 && pesoB === 0 ? null : pesoA >= pesoB ? "a" : "b";
    const apoyos = version === "a" ? apoyosA : version === "b" ? apoyosB : 0;
    let estado: EstadoEvento = "sin";
    if (version) {
      if (pesoA > 0 && pesoB > 0) estado = "disputa";
      else estado = apoyos >= 2 ? "corroborada" : "una";
    }
    return { ev, estado, version, pesoA, pesoB, apoyos, correcto: version === "a" };
  });
}

/** Solidez 0–100 de la reconstrucción: premia corroborar, castiga las disputas. */
export function solidez(linea: LineaEvento[]): number {
  const pts: Record<EstadoEvento, number> = { sin: 0, una: 10, corroborada: 20, disputa: 5 };
  return linea.reduce((s, l) => s + pts[l.estado], 0);
}

export function correctos(linea: LineaEvento[]): number {
  return linea.filter((l) => l.correcto).length;
}

export function horasGastadas(pistas: string[], contrastes: string[]): number {
  return pistas.length * COSTO_PISTA + contrastes.length * COSTO_CONTRASTE;
}

export function claveContraste(a: string, b: string): string {
  return [a, b].sort().join("|");
}
