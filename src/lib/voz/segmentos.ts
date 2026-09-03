/**
 * CÓMO SE PARTE UN TEXTO EN CLIPS DE VOZ. Datos puros, sin React ni Node.
 *
 * Esta es la regla que decide qué se graba y con qué nombre, y tiene que ser
 * UNA SOLA. La usan dos lados que no se hablan:
 *   · `scripts/extraer-voz-actividades.ts`, que arma la lista para grabar.
 *   · `NarracionContext`, que en el navegador pide el MP3 de cada trozo.
 * Si cada uno partiera el texto a su manera, el reproductor pediría `p-4` de un
 * párrafo que se grabó como `p-3` y la lectura sonaría corrida. Por eso vive
 * aquí y no duplicada en los dos.
 */

/**
 * Lo que se le quita al texto antes de pronunciarlo.
 *
 * No es maquillaje: `→` se lee "flecha hacia la derecha" en voz alta, los
 * asteriscos de negrita se leen "asterisco asterisco" y las comillas angulares
 * salen como "comilla". Lo que se escribe en pantalla y lo que se pronuncia no
 * tienen por qué ser lo mismo.
 */
export function paraDecir(t: string): string {
  return String(t)
    .replace(/\*\*(.+?)\*\*/g, "$1")            // **negrita**
    .replace(/(^|\s)\*(\S[^*]*?)\*/g, "$1$2")   // *cursiva*
    .replace(/^#{1,6}\s+/gm, "")                 // ## títulos
    .replace(/^\s*[-•]\s+/gm, "")                // viñetas
    .replace(/[«»""]/g, "")
    .replace(/\s*\|\s*/g, ", ")                  // celdas de tabla
    .replace(/\s*·\s*/g, ", ")
    .replace(/\s*→\s*/g, " a ")
    .replace(/\s*—\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * ¿Vale la pena grabar este trozo? Una raya de tabla o un número suelto no:
 * el clip sale de medio segundo y en la cola sólo mete un tropiezo.
 */
export function valeLaPenaDecir(t: string): boolean {
  return t.length >= 12 && /[a-záéíóúñ]{3}/i.test(t);
}

export interface SegmentoVoz {
  /** Nombre del MP3 dentro de la carpeta de la actividad (sin extensión). */
  clave: string;
  /** El texto tal como se pronunció; es también el subtítulo que se resalta. */
  texto: string;
}

/**
 * Los clips de una actividad de lectura, en el orden en que se escuchan.
 *
 * Las claves son un contrato con los archivos ya grabados: `titulo`, `p-0`,
 * `p-1`, … Cambiar esta función obliga a volver a grabar
 * (`python scripts/narrar-actividades.py --rehacer`).
 */
export function segmentosDeLectura(titulo: string, texto: string): SegmentoVoz[] {
  const segs: SegmentoVoz[] = [];
  const add = (clave: string, crudo: unknown) => {
    const t = paraDecir(String(crudo ?? ""));
    if (valeLaPenaDecir(t)) segs.push({ clave, texto: t });
  };

  add("titulo", titulo);
  const parrafos = String(texto ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  parrafos.forEach((p, i) => add(`p-${i}`, p));

  return segs;
}

/**
 * Los clips de una infografía.
 *
 * POR QUÉ TIENE SU PROPIA FUNCIÓN Y NO REUSA LA DE ARRIBA. Una infografía no
 * tiene prosa: tiene un título y una lista de puntos clave. Si se pegaran todos
 * los puntos en un solo texto y se partiera por párrafos, saldría un clip
 * gigante donde la voz enumera diez ideas sin respirar, que es justo lo que la
 * infografía evita al presentarlas en una rejilla.
 *
 * UN PUNTO, UN CLIP. Así el alumno oye una idea, la ve resaltada en su tarjeta
 * y pasa a la siguiente — el mismo ritmo con el que se lee el cartel.
 *
 * LAS CLAVES SON `punto-0`, `punto-1`… A PROPÓSITO, no `p-0`. Una infografía y
 * una lectura pueden ser la misma actividad reescrita mañana; si compartieran
 * prefijo, el reproductor pediría el MP3 del párrafo viejo para el punto nuevo
 * y sonaría otra cosa. Prefijos distintos hacen imposible esa confusión.
 *
 * `fuente` NO se narra: "Fuente: INEGI, 2023" en voz alta interrumpe el cierre
 * sin aportar nada que no se lea mejor en pantalla.
 */
export function segmentosDeInfografia(titulo: string, puntosClave: unknown): SegmentoVoz[] {
  const segs: SegmentoVoz[] = [];
  const add = (clave: string, crudo: unknown) => {
    const t = paraDecir(String(crudo ?? ""));
    if (valeLaPenaDecir(t)) segs.push({ clave, texto: t });
  };

  add("titulo", titulo);
  const puntos = Array.isArray(puntosClave) ? puntosClave : [];
  puntos.forEach((p, i) => add(`punto-${i}`, p));

  return segs;
}
