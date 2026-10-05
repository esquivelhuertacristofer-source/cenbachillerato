/**
 * Simulador del Laboratorio — Comunicación digital multimodal (CD-III-P01).
 *
 * Lógica pura (sin React): el alumno compone una publicación para una campaña
 * FICTICIA combinando modos semióticos (texto, imagen, audio, color y diseño
 * espacial) y tres medidores responden. Todas las cifras son valores de juego
 * («simulación»), no estadísticas reales.
 *
 * La idea que se descubre es la de la definición verbatim de «Comunicación
 * multimodal»: el significado emerge de la INTERACCIÓN entre los modos, no de
 * cada uno por separado. Por eso, además del efecto de cada elección, hay
 * reglas de combinación que suman o contradicen significado.
 */

export type SlotId = "texto" | "imagen" | "audio" | "color" | "diseno";

export interface Efecto {
  claridad: number;
  alcance: number;
  acc: number;
}

export interface OpcionModo {
  id: string;
  nombre: string;
  icono: string;
  /** Qué es, en una frase corta. */
  detalle: string;
  efecto: Efecto;
}

export const SLOTS: { id: SlotId; titulo: string; icono: string; opciones: OpcionModo[] }[] = [
  {
    id: "texto",
    titulo: "Texto",
    icono: "fa-font",
    opciones: [
      { id: "sin", nombre: "Sin texto", icono: "fa-ban", detalle: "Nada escrito.", efecto: { claridad: -8, alcance: 0, acc: -8 } },
      { id: "titular", nombre: "Titular corto", icono: "fa-heading", detalle: "Una frase grande y directa.", efecto: { claridad: 22, alcance: 8, acc: 15 } },
      { id: "parrafo", nombre: "Párrafo largo", icono: "fa-align-left", detalle: "Todos los detalles por escrito.", efecto: { claridad: 5, alcance: -10, acc: 8 } },
    ],
  },
  {
    id: "imagen",
    titulo: "Imagen",
    icono: "fa-image",
    opciones: [
      { id: "sin", nombre: "Sin imagen", icono: "fa-ban", detalle: "Nada que ver.", efecto: { claridad: 0, alcance: -12, acc: 0 } },
      { id: "foto", nombre: "Fotografía", icono: "fa-camera", detalle: "Una foto de la jornada.", efecto: { claridad: 10, alcance: 18, acc: -5 } },
      { id: "icono", nombre: "Ícono simple", icono: "fa-recycle", detalle: "Un símbolo grande y sencillo.", efecto: { claridad: 12, alcance: 8, acc: 5 } },
    ],
  },
  {
    id: "audio",
    titulo: "Audio",
    icono: "fa-volume-high",
    opciones: [
      { id: "sin", nombre: "Sin audio", icono: "fa-volume-xmark", detalle: "Silencio.", efecto: { claridad: 0, alcance: 0, acc: 0 } },
      { id: "musica", nombre: "Música de fondo", icono: "fa-music", detalle: "Una melodía animada.", efecto: { claridad: -8, alcance: 10, acc: -8 } },
      { id: "locucion", nombre: "Locución clara", icono: "fa-microphone", detalle: "Una voz que dice el mensaje.", efecto: { claridad: 10, alcance: 12, acc: 14 } },
    ],
  },
  {
    id: "color",
    titulo: "Color",
    icono: "fa-palette",
    opciones: [
      { id: "pastel", nombre: "Pastel suave", icono: "fa-droplet", detalle: "Tonos claros sobre fondo claro.", efecto: { claridad: -12, alcance: -4, acc: -18 } },
      { id: "contraste", nombre: "Alto contraste", icono: "fa-circle-half-stroke", detalle: "Letras oscuras sobre amarillo.", efecto: { claridad: 12, alcance: 4, acc: 14 } },
      { id: "neon", nombre: "Neón saturado", icono: "fa-bolt", detalle: "Colores muy vivos y chillones.", efecto: { claridad: -6, alcance: 10, acc: -14 } },
    ],
  },
  {
    id: "diseno",
    titulo: "Diseño espacial",
    icono: "fa-table-cells-large",
    opciones: [
      { id: "apretado", nombre: "Todo apretado", icono: "fa-compress", detalle: "Todo junto y sin aire.", efecto: { claridad: -18, alcance: -4, acc: -10 } },
      { id: "jerarquia", nombre: "Jerarquía clara", icono: "fa-layer-group", detalle: "Lo importante arriba y grande.", efecto: { claridad: 16, alcance: 6, acc: 10 } },
      { id: "centrado", nombre: "Un bloque centrado", icono: "fa-align-center", detalle: "Todo del mismo tamaño al centro.", efecto: { claridad: 4, alcance: 0, acc: 2 } },
    ],
  },
];

export type Seleccion = Record<SlotId, string>;

/** Punto de partida: nada elegido de lo opcional y el diseño apretado. */
export const SELECCION_INICIAL: Seleccion = { texto: "sin", imagen: "sin", audio: "sin", color: "pastel", diseno: "apretado" };

export interface Escenario {
  id: string;
  titulo: string;
  canal: string;
  publico: string;
  /** Lo que el público necesita, para guiar sin regalar la composición. */
  necesidad: string;
  icono: string;
  foto: string;
  /** Ajustes sobre el efecto base de una opción en ESTE canal y público. */
  ajustes: Record<string, Partial<Efecto> & { nota: string }>;
}

export const ESCENARIOS: Escenario[] = [
  {
    id: "mercado",
    titulo: "Cartel del mercado",
    canal: "Papel pegado en la entrada del mercado",
    publico: "Vecinos y vecinas, muchas personas mayores",
    necesidad: "Se lee de pie y de lejos; en papel no suena nada.",
    icono: "fa-store",
    foto: "escenario-mercado",
    ajustes: {
      "audio:musica": { claridad: -2, alcance: -16, acc: -4, nota: "En un cartel de papel no suena nada: el audio se pierde." },
      "audio:locucion": { claridad: -6, alcance: -14, acc: -12, nota: "Una locución no se oye desde un cartel de papel." },
      "color:pastel": { acc: -8, nota: "Para personas mayores el pastel casi no se distingue de lejos." },
      "color:contraste": { acc: 6, nota: "El alto contraste se lee de lejos, incluso con poca vista." },
      "texto:titular": { claridad: 4, alcance: 6, nota: "Un titular grande se lee de un vistazo al pasar." },
      "imagen:icono": { alcance: 6, nota: "Un símbolo grande se reconoce desde lejos." },
      "texto:parrafo": { claridad: -6, nota: "Nadie lee un párrafo largo de pie frente a un cartel." },
    },
  },
  {
    id: "historia",
    titulo: "Historia vertical",
    canal: "Historia de 15 segundos en una red social",
    publico: "Jóvenes que deslizan rápido con el celular",
    necesidad: "Se ve en segundos y suele verse con sonido.",
    icono: "fa-mobile-screen",
    foto: "escenario-jovenes",
    ajustes: {
      "texto:parrafo": { claridad: -12, alcance: -6, nota: "En 15 segundos nadie alcanza a leer un párrafo largo." },
      "audio:musica": { claridad: 6, alcance: 8, nota: "La música ayuda a que la historia se sienta viva en esta red." },
      "imagen:foto": { alcance: 8, nota: "Una foto atrae la mirada al deslizar." },
      "imagen:icono": { alcance: -4, nota: "Un ícono solo pasa desapercibido entre tantas imágenes." },
      "color:neon": { claridad: 2, alcance: 6, nota: "El color llamativo detiene el dedo, pero cuesta leerlo." },
    },
  },
  {
    id: "vecinal",
    titulo: "Grupo vecinal",
    canal: "Mensaje en un grupo de mensajería de la colonia",
    publico: "Personas con baja visión y personas sordas",
    necesidad: "Hay que poder leerlo con poca vista y entenderlo sin oír.",
    icono: "fa-users",
    foto: "escenario-vecinal",
    ajustes: {
      "imagen:foto": { acc: -6, nota: "Una foto sin descripción no la perciben quienes tienen baja visión." },
      "audio:musica": { acc: -8, nota: "La música no dice nada a quien no oye y estorba a quien oye mal." },
      "audio:locucion": { acc: 6, nota: "La voz ayuda a quien ve poco, pero solo si también hay texto." },
      "color:pastel": { acc: -8, nota: "Con baja visión el pastel sobre claro desaparece." },
      "color:contraste": { acc: 8, nota: "El contraste fuerte es lo más importante con baja visión." },
      "texto:titular": { acc: 4, nota: "El texto es la vía que llega a quien no oye." },
    },
  },
];

export interface Regla {
  id: string;
  /** ¿Se cumple con esta selección? */
  si: (s: Seleccion) => boolean;
  efecto: Partial<Efecto>;
  tono: "suma" | "resta";
  texto: string;
}

export const REGLAS: Regla[] = [
  {
    id: "refuerzo",
    si: (s) => s.texto === "titular" && s.imagen !== "sin",
    efecto: { claridad: 8, acc: 4 },
    tono: "suma",
    texto: "Imagen y titular dicen lo mismo con dos modos: el significado se refuerza.",
  },
  {
    id: "jerarquia-completa",
    si: (s) => s.diseno === "jerarquia" && s.texto === "titular" && s.imagen !== "sin",
    efecto: { claridad: 6, alcance: 4 },
    tono: "suma",
    texto: "El diseño pone cada modo en su lugar: primero el titular, luego la imagen.",
  },
  {
    id: "doble-via",
    si: (s) => s.audio === "locucion" && s.texto === "titular",
    efecto: { acc: 8 },
    tono: "suma",
    texto: "El mensaje llega por oído y por vista: más personas lo reciben.",
  },
  {
    id: "compiten",
    si: (s) => s.audio !== "sin" && s.texto === "parrafo",
    efecto: { claridad: -10, alcance: -4, acc: -4 },
    tono: "resta",
    texto: "Escuchar y leer un párrafo largo a la vez compite por la atención.",
  },
  {
    id: "audio-sin-texto",
    si: (s) => s.audio !== "sin" && s.texto === "sin",
    efecto: { acc: -14 },
    tono: "resta",
    texto: "Solo con audio, las personas sordas se quedan sin el mensaje.",
  },
  {
    id: "vacio",
    si: (s) => s.imagen === "sin" && s.texto === "sin",
    efecto: { claridad: -20 },
    tono: "resta",
    texto: "Sin imagen ni texto no hay nada que ver ni que leer: el mensaje no existe.",
  },
  {
    id: "chillon",
    si: (s) => s.color === "neon" && s.texto === "parrafo",
    efecto: { claridad: -10, acc: -8 },
    tono: "resta",
    texto: "Un párrafo largo sobre colores chillones cansa la vista y se abandona.",
  },
  {
    id: "musica-vs-voz",
    si: (s) => s.audio === "musica" && s.texto === "titular" && s.imagen !== "sin",
    efecto: { alcance: 6 },
    tono: "suma",
    texto: "La música pone el ánimo y el titular con la imagen ponen el mensaje: cada modo hace lo suyo.",
  },
];

export const BASE: Efecto = { claridad: 35, alcance: 30, acc: 35 };
/** Umbral para decir que la publicación es eficaz. */
export const UMBRAL = 70;

export interface Nota {
  clave: string;
  texto: string;
  tono: "suma" | "resta";
  delta: Partial<Efecto>;
}

export interface Resultado {
  claridad: number;
  alcance: number;
  acc: number;
  /** Cuántos modos activos (texto, imagen y audio elegidos; color y diseño siempre cuentan). */
  modos: number;
  notas: Nota[];
  eficaz: boolean;
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function opcion(slot: SlotId, id: string): OpcionModo {
  const s = SLOTS.find((x) => x.id === slot)!;
  return s.opciones.find((o) => o.id === id) ?? s.opciones[0]!;
}

export function evaluar(sel: Seleccion, escenario: Escenario): Resultado {
  const t: Efecto = { ...BASE };
  const notas: Nota[] = [];
  const suma = (e: Partial<Efecto>) => {
    t.claridad += e.claridad ?? 0;
    t.alcance += e.alcance ?? 0;
    t.acc += e.acc ?? 0;
  };
  for (const slot of SLOTS) {
    const o = opcion(slot.id, sel[slot.id]);
    suma(o.efecto);
    const aj = escenario.ajustes[`${slot.id}:${o.id}`];
    if (aj) {
      suma(aj);
      const delta = (aj.claridad ?? 0) + (aj.alcance ?? 0) + (aj.acc ?? 0);
      notas.push({ clave: `${slot.id}:${o.id}`, texto: aj.nota, tono: delta >= 0 ? "suma" : "resta", delta: aj });
    }
  }
  for (const r of REGLAS) {
    if (r.si(sel)) {
      suma(r.efecto);
      notas.push({ clave: r.id, texto: r.texto, tono: r.tono, delta: r.efecto });
    }
  }
  const modos = (sel.texto !== "sin" ? 1 : 0) + (sel.imagen !== "sin" ? 1 : 0) + (sel.audio !== "sin" ? 1 : 0) + 2;
  const claridad = clamp(t.claridad);
  const alcance = clamp(t.alcance);
  const acc = clamp(t.acc);
  return { claridad, alcance, acc, modos, notas, eficaz: claridad >= UMBRAL && alcance >= UMBRAL && acc >= UMBRAL };
}

/** Mínimo de modos para que se pueda publicar como pieza multimodal. */
export const MIN_MODOS_PUBLICAR = 4;

/** Mejor puntaje posible por escenario (para verificar que el reto tiene solución). */
export function mejorCombinacion(escenario: Escenario): { sel: Seleccion; r: Resultado } {
  let mejor: { sel: Seleccion; r: Resultado } | null = null;
  let puntaje = -1;
  const rec = (i: number, acc: Seleccion) => {
    if (i === SLOTS.length) {
      const r = evaluar(acc, escenario);
      const p = Math.min(r.claridad, r.alcance, r.acc);
      if (p > puntaje) {
        puntaje = p;
        mejor = { sel: { ...acc }, r };
      }
      return;
    }
    const slot = SLOTS[i]!;
    for (const o of slot.opciones) rec(i + 1, { ...acc, [slot.id]: o.id });
  };
  rec(0, { ...SELECCION_INICIAL });
  return mejor!;
}
