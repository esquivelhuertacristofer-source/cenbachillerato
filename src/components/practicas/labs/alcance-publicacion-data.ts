/**
 * Datos y modelo del laboratorio "Difusión digital: el alcance de una
 * publicación" (CD-III-P02, progresión 2 de Cultura Digital III).
 *
 * Propósito (verbatim): «Utiliza herramientas de comunicación digital para
 * difundir información, conocimientos, experiencias y aprendizajes, de acuerdo
 * con su contexto personal, académico, social y ambiental.»
 *
 * Anclas (todas verbatim de la plataforma):
 *   - A2 simulación «Diseña una campaña digital inclusiva con perspectiva de
 *     género»: su caso, instrucciones y preguntas inspiran el modo Campaña.
 *   - A4 verdadero/falso: reto evaluable.
 *   - A5 glosario (6 términos) y su actividad final.
 *   - A6 completa el texto.
 *   - A8 video: preguntas de reflexión.
 *   (La progresión no tiene A1, A9 ni A10 en la base de datos.)
 *
 * Lo que NO es verbatim es MODELO ILUSTRATIVO: la red de 150 personas, las
 * probabilidades de ver, reaccionar y compartir, la curva de horario y la
 * cobertura de cada canal por grupo. Las cifras reales citadas llevan fuente:
 *   - INEGI, ENDUTIH 2024: 83.1 % de la población de 6 años o más usa internet
 *     (86.9 % urbano, 68.5 % rural); 97.2 % se conecta desde un celular.
 *   - INEGI, Censo 2020: 6 179 890 personas con discapacidad (4.9 %).
 *   - Vosoughi, Roy y Aral (2018), Science 359: las noticias falsas tuvieron
 *     70 % más probabilidad de ser retuiteadas y la verdad tardó unas seis
 *     veces más en llegar a 1 500 personas.
 *   - WhatsApp (abril 2020): los mensajes «reenviados muchas veces» (5 o más)
 *     solo pueden reenviarse a un chat a la vez; la empresa reportó 70 % menos
 *     reenvíos de ese tipo de mensajes.
 *   - W3C, WCAG 2.2, criterio 1.4.3: contraste mínimo 4.5:1 (3:1 texto grande).
 *   - Kempe, Kleinberg y Tardos (2003): modelo de cascada independiente.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "cascada" | "campana" | "rumor";
export const MODOS: Modo[] = ["cascada", "campana", "rumor"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  cascada: { etq: "Cascada de compartidos", subtitulo: "Alcance, impresiones e interacción", icono: "fa-share-nodes", color: "#38bdf8" },
  campana: { etq: "Campaña comunitaria", subtitulo: "Audiencia, canal y accesibilidad", icono: "fa-bullhorn", color: "#a78bfa" },
  rumor: { etq: "Rumor contra dato", subtitulo: "Frena la desinformación", icono: "fa-shield-halved", color: "#fb7185" },
};

/* ── Utilidades ───────────────────────────────────────────────────────── */

export function mulberry32(semilla: number) {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function num(x: number, dec = 0): string {
  const s = Math.abs(x).toFixed(dec);
  const [ent, frac] = s.split(".");
  const conMiles = ent!.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${x < 0 ? "−" : ""}${conMiles}${frac ? `.${frac}` : ""}`;
}

export const pct = (x: number, dec = 0) => `${num(x * 100, dec)} %`;

/* ════════════════════════════════════════════════════════════════════════
 * LA RED: una comunidad escolar de 150 personas (modelo ilustrativo)
 * ════════════════════════════════════════════════════════════════════════ */

export const N_PERSONAS = 150;
export const N_GRUPO = 24;

export interface Grupo {
  id: string;
  etq: string;
  icono: string;
  color: string;
}

export const GRUPOS: Grupo[] = [
  { id: "salon", etq: "Salón 3.° A", icono: "fa-chalkboard-user", color: "#38bdf8" },
  { id: "familias", etq: "Familias", icono: "fa-house-chimney", color: "#f59e0b" },
  { id: "futbol", etq: "Equipo de futbol", icono: "fa-futbol", color: "#34d399" },
  { id: "vecinos", etq: "Vecinos de la colonia", icono: "fa-people-roof", color: "#f472b6" },
  { id: "docentes", etq: "Docentes", icono: "fa-person-chalkboard", color: "#a78bfa" },
  { id: "mercado", etq: "Mercado y tianguis", icono: "fa-store", color: "#fb923c" },
];

/** Cuentas especiales: índices fijos al final de la lista. */
export const ID_ESCUELA = 144;
export const ID_INFLUENCER = 145;
export const ID_SALUD = 146;
export const ID_TU = 147;
export const ID_MAESTRA = 148;
export const ID_VECINA = 149;

export interface Nodo {
  id: number;
  grupo: number; // índice en GRUPOS, o -1 para cuentas públicas
  pos: [number, number, number];
  nombre?: string;
}

export interface Red {
  nodos: Nodo[];
  aristas: [number, number][];
  vecinos: number[][];
}

function construirRed(): Red {
  const rnd = mulberry32(20250913);
  const nodos: Nodo[] = [];
  const n = N_GRUPO * GRUPOS.length; // 144 personas en grupos
  for (let i = 0; i < n; i++) {
    const g = Math.floor(i / N_GRUPO);
    const ang = (g / GRUPOS.length) * Math.PI * 2;
    const cx = Math.cos(ang) * 4.3;
    const cz = Math.sin(ang) * 4.3;
    // Disco de Fibonacci alrededor del centro del grupo, con relieve.
    const k = i % N_GRUPO;
    const r = 1.35 * Math.sqrt((k + 0.5) / N_GRUPO);
    const th = k * 2.39996;
    nodos.push({ id: i, grupo: g, pos: [cx + Math.cos(th) * r, 0.35 + (rnd() - 0.5) * 0.9, cz + Math.sin(th) * r] });
  }
  nodos.push({ id: ID_ESCUELA, grupo: -1, pos: [0.9, 2.2, 1.9], nombre: "Página de la escuela" });
  nodos.push({ id: ID_INFLUENCER, grupo: -1, pos: [-1.6, 1.8, 0.6], nombre: "Creadora local (TikTok)" });
  nodos.push({ id: ID_SALUD, grupo: -1, pos: [1.6, 1.8, -1.6], nombre: "Centro de salud" });
  // «Tu cuenta», la maestra y la vecina viven dentro de un grupo.
  nodos.push({ id: ID_TU, grupo: 0, pos: [nodos[0]!.pos[0] + 0.1, 1.25, nodos[0]!.pos[2] + 0.1], nombre: "Tu cuenta" });
  nodos.push({ id: ID_MAESTRA, grupo: 4, pos: [nodos[4 * N_GRUPO]!.pos[0], 1.25, nodos[4 * N_GRUPO]!.pos[2]], nombre: "Maestra de biología" });
  nodos.push({ id: ID_VECINA, grupo: 3, pos: [nodos[3 * N_GRUPO]!.pos[0], 1.25, nodos[3 * N_GRUPO]!.pos[2]], nombre: "Vecina que lo desmiente" });

  const set = new Set<string>();
  const aristas: [number, number][] = [];
  const unir = (a: number, b: number) => {
    if (a === b) return;
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (set.has(key)) return;
    set.add(key);
    aristas.push(a < b ? [a, b] : [b, a]);
  };
  // Dentro de cada grupo: anillo con 2 vecinos por lado + atajos al azar.
  for (let g = 0; g < GRUPOS.length; g++) {
    const base = g * N_GRUPO;
    for (let k = 0; k < N_GRUPO; k++) {
      unir(base + k, base + ((k + 1) % N_GRUPO));
      unir(base + k, base + ((k + 2) % N_GRUPO));
      if (rnd() < 0.55) unir(base + k, base + Math.floor(rnd() * N_GRUPO));
    }
  }
  // Puentes entre grupos (amistades, parentescos).
  for (let i = 0; i < n; i++) if (rnd() < 0.42) unir(i, Math.floor(rnd() * n));
  // Cuentas públicas con muchos seguidores.
  const seguidores = (id: number, cuantos: number, peso: number[]) => {
    const total = peso.reduce((a, b) => a + b, 0);
    let hechos = 0;
    let guard = 0;
    while (hechos < cuantos && guard++ < 5000) {
      let x = rnd() * total;
      let g = 0;
      while (x > peso[g]! && g < peso.length - 1) {
        x -= peso[g]!;
        g++;
      }
      const j = g * N_GRUPO + Math.floor(rnd() * N_GRUPO);
      const antes = aristas.length;
      unir(id, j);
      if (aristas.length > antes) hechos++;
    }
  };
  seguidores(ID_ESCUELA, 62, [3, 3, 1, 1, 3, 0.5]);
  seguidores(ID_INFLUENCER, 48, [3, 1, 3, 1.5, 0.3, 1]);
  seguidores(ID_SALUD, 32, [0.5, 3, 0.5, 3, 1, 2]);
  // Tu cuenta: tus 11 contactos, casi todos del salón.
  for (let k = 0; k < 8; k++) unir(ID_TU, k * 3);
  unir(ID_TU, 2 * N_GRUPO + 4);
  unir(ID_TU, 2 * N_GRUPO + 9);
  unir(ID_TU, 1 * N_GRUPO + 7);
  // Maestra: docentes + algunas familias y alumnos.
  for (let k = 0; k < 9; k++) unir(ID_MAESTRA, 4 * N_GRUPO + k * 2 + 1);
  for (let k = 0; k < 5; k++) unir(ID_MAESTRA, k * 5 + 2);
  unir(ID_MAESTRA, 1 * N_GRUPO + 3);
  // Vecina: 10 vecinos.
  for (let k = 0; k < 10; k++) unir(ID_VECINA, 3 * N_GRUPO + k * 2 + 1);
  unir(ID_ESCUELA, ID_MAESTRA);
  unir(ID_SALUD, ID_MAESTRA);

  const vecinos: number[][] = Array.from({ length: N_PERSONAS }, () => []);
  for (const [a, b] of aristas) {
    vecinos[a]!.push(b);
    vecinos[b]!.push(a);
  }
  return { nodos, aristas, vecinos };
}

export const RED: Red = construirRed();
/** Las cuentas institucionales (escuela, creadora, centro de salud) no cuentan como habitantes. */
export const esPublica = (id: number) => id === ID_ESCUELA || id === ID_INFLUENCER || id === ID_SALUD;
export const N_HABITANTES = N_PERSONAS - 3;
export const grado = (id: number) => RED.vecinos[id]!.length;

/* ════════════════════════════════════════════════════════════════════════
 * 1. CASCADA DE COMPARTIDOS
 * ════════════════════════════════════════════════════════════════════════ */

export type OrigenId = "tu" | "escuela" | "influencer";
export const ORIGENES: { id: OrigenId; nodo: number; etq: string; icono: string; nota: string }[] = [
  { id: "tu", nodo: ID_TU, etq: "Tu cuenta", icono: "fa-user", nota: "Una cuenta personal: la ven tus contactos, casi todos de tu salón." },
  { id: "escuela", nodo: ID_ESCUELA, etq: "Página de la escuela", icono: "fa-school", nota: "La siguen alumnos, familias y docentes de todos los grupos." },
  { id: "influencer", nodo: ID_INFLUENCER, etq: "Creadora local", icono: "fa-star", nota: "Muchos seguidores jóvenes; llega poco a docentes y familias." },
];

export type FormatoId = "texto" | "imagen" | "video";
/** Probabilidades por persona que VE la publicación (ilustrativas). */
export const FORMATOS: { id: FormatoId; etq: string; icono: string; comparte: number; reacciona: number; nota: string }[] = [
  { id: "texto", etq: "Solo texto", icono: "fa-align-left", comparte: 0.035, reacciona: 0.06, nota: "Un bloque de texto se desliza de largo con facilidad." },
  { id: "imagen", etq: "Imagen o infografía", icono: "fa-image", comparte: 0.07, reacciona: 0.11, nota: "Una imagen clara detiene el desplazamiento y se entiende rápido." },
  { id: "video", etq: "Video corto", icono: "fa-film", comparte: 0.1, reacciona: 0.15, nota: "El video corto suele generar más reacciones y compartidos." },
];

/** Fracción de la comunidad conectada y mirando su feed a cada hora (curva ilustrativa). */
export const ACTIVIDAD_HORA: number[] = [0.2, 0.13, 0.09, 0.07, 0.07, 0.11, 0.24, 0.4, 0.5, 0.5, 0.52, 0.55, 0.6, 0.66, 0.66, 0.6, 0.58, 0.63, 0.72, 0.8, 0.86, 0.88, 0.72, 0.42];

export const horaEtq = (h: number) => `${String(h).padStart(2, "0")}:00`;

/** Multiplicador del llamado a la acción («compártelo con tu grupo»). */
export const LLAMADO = 1.5;

export interface Exposicion {
  /** Quién la mostró (el que la publicó o compartió). */
  de: number;
  a: number;
  /** Segundo de la animación en que llega. */
  t: number;
  /** Primera vez que esta persona la ve (cuenta para el alcance). */
  nueva: boolean;
  reacciona: boolean;
  comparte: boolean;
  /** Para el modo rumor: 0 = rumor, 1 = dato verificado. */
  tipo?: 0 | 1;
  /** Estado de la persona que la recibe tras esta exposición (modo rumor). */
  estado?: EstadoRumor;
}

export interface ResultadoCascada {
  eventos: Exposicion[];
  alcance: number;
  impresiones: number;
  reacciones: number;
  compartidos: number;
  duracion: number;
  oleadas: number;
}

export const SEG_OLEADA = 1.05;
export const MAX_OLEADAS = 14;

export function simularCascada(cfg: { origen: number; formato: FormatoId; hora: number; llamado: boolean }, rnd: () => number): ResultadoCascada {
  const f = FORMATOS.find((x) => x.id === cfg.formato)!;
  const activa = ACTIVIDAD_HORA[cfg.hora] ?? 0.5;
  const pComparte = Math.min(0.6, f.comparte * (cfg.llamado ? LLAMADO : 1));
  const visto = new Uint8Array(N_PERSONAS);
  visto[cfg.origen] = 1;
  const eventos: Exposicion[] = [];
  let frontera = [cfg.origen];
  let oleada = 0;
  let alcance = 0;
  let reacciones = 0;
  let compartidos = 0;
  while (frontera.length > 0 && oleada < MAX_OLEADAS) {
    const siguiente: number[] = [];
    frontera.forEach((s, si) => {
      for (const j of RED.vecinos[s]!) {
        if (j === cfg.origen) continue;
        if (rnd() >= activa) continue; // no estaba conectada: no la ve
        const nueva = !visto[j];
        let reacciona = false;
        let comparte = false;
        if (nueva) {
          visto[j] = 1;
          alcance++;
          comparte = rnd() < pComparte;
          reacciona = comparte || rnd() < f.reacciona;
          if (comparte) {
            compartidos++;
            siguiente.push(j);
          }
          if (reacciona) reacciones++;
        }
        const t = oleada * SEG_OLEADA + 0.1 + ((si * 0.37) % 0.5) + rnd() * 0.25;
        eventos.push({ de: s, a: j, t, nueva, reacciona, comparte });
      }
    });
    frontera = siguiente;
    oleada++;
  }
  eventos.sort((a, b) => a.t - b.t);
  const duracion = (eventos.at(-1)?.t ?? 0) + DUR_PULSO + 0.3;
  return { eventos, alcance, impresiones: eventos.length, reacciones, compartidos, duracion, oleadas: oleada };
}

/** Segundos que tarda un pulso en recorrer una arista. */
export const DUR_PULSO = 0.75;

/** Tasa de interacción por alcance, en %. */
export const tasaInteraccion = (reacciones: number, alcance: number) => (alcance > 0 ? (reacciones / alcance) * 100 : 0);
export const TOLERANCIA_TASA = 0.6;

/* ════════════════════════════════════════════════════════════════════════
 * 2. CAMPAÑA COMUNITARIA (inspirada en la simulación A2)
 * ════════════════════════════════════════════════════════════════════════ */

export type SegmentoId = "estudiantes" | "familias" | "docentes" | "mayores" | "rural";
export interface Segmento {
  id: SegmentoId;
  etq: string;
  icono: string;
  personas: number;
  color: string;
}
/** Una comunidad de 1 000 personas (ilustrativa). */
export const SEGMENTOS: Segmento[] = [
  { id: "estudiantes", etq: "Estudiantes", icono: "fa-graduation-cap", personas: 250, color: "#38bdf8" },
  { id: "familias", etq: "Madres, padres y tutores", icono: "fa-people-roof", personas: 300, color: "#f59e0b" },
  { id: "docentes", etq: "Docentes", icono: "fa-person-chalkboard", personas: 40, color: "#a78bfa" },
  { id: "mayores", etq: "Personas mayores", icono: "fa-person-cane", personas: 160, color: "#34d399" },
  { id: "rural", etq: "Localidad rural", icono: "fa-tractor", personas: 250, color: "#fb923c" },
];

export type CanalId = "whatsapp" | "facebook" | "tiktok" | "radio" | "cartel" | "web";
export type Soporte = "imagen" | "video" | "audio" | "impreso" | "texto";
export interface Canal {
  id: CanalId;
  /** Nombre corto para la escena 3D. */
  corto: string;
  etq: string;
  icono: string;
  color: string;
  soporte: Soporte;
  digital: boolean;
  /** Fracción de cada grupo que vería el mensaje por este canal (ilustrativa). */
  cobertura: Record<SegmentoId, number>;
  nota: string;
}

export const CANALES: Canal[] = [
  { id: "whatsapp", corto: "WhatsApp", etq: "Grupos de WhatsApp", icono: "fa-brands fa-whatsapp", color: "#22c55e", soporte: "imagen", digital: true, cobertura: { estudiantes: 0.55, familias: 0.8, docentes: 0.85, mayores: 0.45, rural: 0.35 }, nota: "Llega a quien está en los grupos de la escuela y de la colonia; en la localidad rural la señal y los datos limitan." },
  { id: "facebook", corto: "Facebook", etq: "Página de Facebook", icono: "fa-brands fa-facebook", color: "#3b82f6", soporte: "imagen", digital: true, cobertura: { estudiantes: 0.3, familias: 0.6, docentes: 0.55, mayores: 0.3, rural: 0.25 }, nota: "Lo usan más las personas adultas; solo ven la publicación quienes siguen la página." },
  { id: "tiktok", corto: "TikTok", etq: "Video en TikTok / Reels", icono: "fa-brands fa-tiktok", color: "#ec4899", soporte: "video", digital: true, cobertura: { estudiantes: 0.8, familias: 0.3, docentes: 0.25, mayores: 0.1, rural: 0.2 }, nota: "Muy visto por adolescentes; casi no llega a personas mayores." },
  { id: "radio", corto: "Radio", etq: "Radio comunitaria", icono: "fa-tower-broadcast", color: "#ef4444", soporte: "audio", digital: false, cobertura: { estudiantes: 0.15, familias: 0.4, docentes: 0.3, mayores: 0.65, rural: 0.7 }, nota: "No necesita internet: llega a la localidad rural y a personas mayores, pero no a personas sordas." },
  { id: "cartel", corto: "Cartel", etq: "Cartel en escuela y mercado", icono: "fa-note-sticky", color: "#eab308", soporte: "impreso", digital: false, cobertura: { estudiantes: 0.45, familias: 0.35, docentes: 0.6, mayores: 0.3, rural: 0.15 }, nota: "Lo ve quien pasa por ahí; no se puede leer con lector de pantalla." },
  { id: "web", corto: "Sitio web", etq: "Sitio web de la escuela", icono: "fa-globe", color: "#14b8a6", soporte: "texto", digital: true, cobertura: { estudiantes: 0.1, familias: 0.15, docentes: 0.4, mayores: 0.05, rural: 0.05 }, nota: "Casi nadie entra por iniciativa propia: sirve como archivo, no para difundir." },
];

export type AccesoId = "alt" | "subtitulos" | "contraste" | "claro";
export const ACCESOS: { id: AccesoId; etq: string; icono: string; explica: string }[] = [
  { id: "alt", etq: "Texto alternativo / descripción de la imagen", icono: "fa-universal-access", explica: "Un lector de pantalla lee la descripción: la imagen deja de ser un hueco para una persona ciega." },
  { id: "subtitulos", etq: "Subtítulos revisados en el video", icono: "fa-closed-captioning", explica: "Una persona sorda sigue el video; los subtítulos automáticos fallan con acentos y nombres, por eso se revisan." },
  { id: "contraste", etq: "Contraste alto (mínimo 4.5:1)", icono: "fa-circle-half-stroke", explica: "Texto oscuro sobre fondo claro (o al revés) se lee con baja visión, en pantallas viejas o bajo el sol." },
  { id: "claro", etq: "Lenguaje claro e incluyente", icono: "fa-comment-dots", explica: "Frases cortas, sin tecnicismos y que nombran a todas las personas: más gente entiende qué hacer." },
];

/** Grupos dentro de la audiencia que el modelo sigue aparte. */
export type SubgrupoId = "ciegas" | "sordas";
export const SUBGRUPOS: { id: SubgrupoId; etq: string; icono: string }[] = [
  { id: "ciegas", etq: "Personas ciegas o con baja visión", icono: "fa-eye-low-vision" },
  { id: "sordas", etq: "Personas sordas", icono: "fa-ear-deaf" },
];

/**
 * Fracción del mensaje que COMPRENDE una persona según el soporte del canal y
 * la accesibilidad elegida. «general» = sin discapacidad sensorial.
 */
export function accesoCanal(soporte: Soporte, sub: "general" | SubgrupoId, acc: Set<AccesoId>, segmento: SegmentoId): number {
  const claro = acc.has("claro") ? 1 : 0.82;
  const contraste = acc.has("contraste") ? 1 : segmento === "mayores" ? 0.8 : 0.93;
  const visual = soporte === "imagen" || soporte === "impreso" || soporte === "texto";
  if (sub === "general") {
    if (soporte === "audio") return claro;
    if (soporte === "video") return claro * (acc.has("contraste") ? 1 : 0.96);
    return claro * contraste;
  }
  if (sub === "ciegas") {
    if (soporte === "audio") return claro;
    if (soporte === "video") return 0.6 * claro; // se oye la narración, se pierde lo escrito en pantalla
    if (soporte === "impreso") return acc.has("contraste") ? 0.25 : 0.05; // solo baja visión con contraste alto
    return (acc.has("alt") ? 0.9 : 0.12) * claro;
  }
  // sordas
  if (soporte === "audio") return 0;
  if (soporte === "video") return (acc.has("subtitulos") ? 0.92 : 0.12) * claro;
  return 0.95 * claro * (visual && segmento === "mayores" && !acc.has("contraste") ? 0.85 : 1);
}

/** Cobertura efectiva (ve y comprende) de un grupo con los canales elegidos. */
export function coberturaSegmento(seg: SegmentoId, canales: CanalId[], acc: Set<AccesoId>, sub: "general" | SubgrupoId = "general"): number {
  let noLlega = 1;
  for (const c of canales) {
    const canal = CANALES.find((x) => x.id === c)!;
    noLlega *= 1 - canal.cobertura[seg] * accesoCanal(canal.soporte, sub, acc, seg);
  }
  return 1 - noLlega;
}

/** Cobertura ponderada por personas sobre la audiencia elegida. */
export function coberturaAudiencia(audiencia: SegmentoId[], canales: CanalId[], acc: Set<AccesoId>, sub: "general" | SubgrupoId = "general"): number {
  let tot = 0;
  let llega = 0;
  for (const s of audiencia) {
    const p = SEGMENTOS.find((x) => x.id === s)!.personas;
    tot += p;
    llega += p * coberturaSegmento(s, canales, acc, sub);
  }
  return tot > 0 ? llega / tot : 0;
}

export type TipoIndicador = "vanidad" | "alcance" | "impacto";
export interface Indicador {
  id: string;
  etq: string;
  tipo: TipoIndicador;
  porque: string;
}

export interface CasoCampana {
  id: string;
  etq: string;
  icono: string;
  tema: "género" | "salud" | "ambiente";
  planteamiento: string;
  audiencia: SegmentoId[];
  porqueAudiencia: string;
  indicadores: Indicador[];
  fuente: string;
}

export const META_COBERTURA = 0.7;
export const META_ACCESIBLE = 0.5;
export const MAX_CANALES = 2;

export const CASOS: CasoCampana[] = [
  {
    id: "robotica",
    etq: "Más chicas en robótica",
    icono: "fa-robot",
    tema: "género",
    planteamiento:
      "Actualmente, los talleres de robótica y programación tienen menos del 15% de participación femenina. Tu campaña debe usar al menos dos plataformas digitales, tener perspectiva de género en su lenguaje e imágenes, y llegar a toda la comunidad escolar.",
    audiencia: ["estudiantes", "familias"],
    porqueAudiencia: "Quienes deciden inscribirse son las alumnas, y muchas familias pesan en esa decisión; los prejuicios de las familias son uno de los obstáculos que menciona la simulación A2.",
    indicadores: [
      { id: "insc", etq: "Porcentaje de inscripciones femeninas en talleres de tecnología antes y después de la campaña", tipo: "impacto", porque: "Mide el cambio que busca la campaña (ejemplo verbatim de la simulación A2)." },
      { id: "likes", etq: "Número de «me gusta» del video", tipo: "vanidad", porque: "Un «me gusta» no dice si alguna alumna se inscribió." },
      { id: "vistas", etq: "Reproducciones del video", tipo: "alcance", porque: "Dice cuántas veces se vio, no si cambió algo." },
      { id: "perm", etq: "Alumnas que siguen en el taller al terminar el semestre", tipo: "impacto", porque: "Mide si la participación se sostiene, no solo si llegaron el primer día." },
      { id: "seg", etq: "Seguidores nuevos de la página", tipo: "vanidad", porque: "Crecer la página no es el objetivo de la campaña." },
    ],
    fuente: "Caso verbatim de la simulación A2.",
  },
  {
    id: "dengue",
    etq: "Descacharrización contra el dengue",
    icono: "fa-mosquito",
    tema: "salud",
    planteamiento:
      "El centro de salud organiza una jornada para eliminar recipientes con agua estancada, donde se cría el mosco que transmite el dengue. La campaña debe llegar a los hogares de la colonia y de la localidad rural, incluidas las personas mayores.",
    audiencia: ["familias", "mayores", "rural"],
    porqueAudiencia: "Los criaderos están en patios y azoteas: quienes pueden vaciarlos son las personas que cuidan cada hogar, también en la localidad rural, donde el internet llega menos.",
    indicadores: [
      { id: "hogares", etq: "Hogares que sacaron cacharros el día de la jornada", tipo: "impacto", porque: "Es la acción concreta que la campaña pide." },
      { id: "larvas", etq: "Viviendas con larvas de mosco antes y después (revisión del centro de salud)", tipo: "impacto", porque: "Mide el efecto sanitario que se busca." },
      { id: "compart", etq: "Veces que se compartió la infografía", tipo: "alcance", porque: "Indica difusión, no que alguien vació su tinaco." },
      { id: "reacc", etq: "Reacciones en la publicación", tipo: "vanidad", porque: "Un corazón no elimina criaderos." },
      { id: "radio", etq: "Minutos al aire en la radio", tipo: "alcance", porque: "Es esfuerzo invertido, no resultado." },
    ],
    fuente: "Caso didáctico; la eliminación de criaderos es la medida que recomienda la Secretaría de Salud.",
  },
  {
    id: "acopio",
    etq: "Acopio de pilas y electrónicos",
    icono: "fa-recycle",
    tema: "ambiente",
    planteamiento:
      "La escuela instala un centro de acopio de pilas y aparatos electrónicos viejos durante una semana. Hay que convencer a estudiantes, docentes y familias de traerlos en lugar de tirarlos a la basura.",
    audiencia: ["estudiantes", "docentes", "familias"],
    porqueAudiencia: "Los aparatos viejos están en las casas: el alumnado y el personal los traen a la escuela, y las familias deciden sacarlos.",
    indicadores: [
      { id: "kg", etq: "Kilogramos de pilas y electrónicos recolectados", tipo: "impacto", porque: "Es el resultado ambiental directo." },
      { id: "fam", etq: "Número de familias distintas que llevaron algo", tipo: "impacto", porque: "Mide participación real de la comunidad." },
      { id: "vistas", etq: "Visualizaciones de la historia", tipo: "alcance", porque: "Dice a cuántas pantallas llegó, no cuánto se recolectó." },
      { id: "likes", etq: "«Me gusta» del cartel digital", tipo: "vanidad", porque: "No se traduce en aparatos entregados." },
      { id: "coment", etq: "Comentarios en la publicación", tipo: "vanidad", porque: "Conversar no equivale a participar." },
    ],
    fuente: "Caso didáctico.",
  },
];

/* ════════════════════════════════════════════════════════════════════════
 * 3. RUMOR CONTRA DATO VERIFICADO
 * ════════════════════════════════════════════════════════════════════════ */

export type EstadoRumor = 0 | 1 | 2 | 3; // 0 sin enterarse, 1 cree el rumor, 2 recibió primero el dato, 3 creyó y se corrigió

export const RUMOR = {
  texto: "«¡Reenvía! El dengue se cura con té de hojas de papaya, no hace falta ir al médico.»",
  dato: "No hay té que cure el dengue. Ante fiebre alta, dolor de cuerpo o manchas en la piel, acude a tu centro de salud y no te automediques.",
  /** La cadena ya circula en tres grupos de WhatsApp: la colonia, las familias y el mercado. */
  origenes: [3 * N_GRUPO + 17, 1 * N_GRUPO + 10, 5 * N_GRUPO + 6],
};

/** Probabilidad de compartir el dato verificado al recibirlo (ilustrativa). */
export const P_DATO = 0.14;
/** Vosoughi, Roy y Aral (2018): lo falso tuvo 70 % más probabilidad de compartirse. */
export const FACTOR_FALSO = 1.7;
export const ACTIVA_RUMOR = 0.82;

export type FuenteId = "ninguna" | "vecina" | "maestra" | "salud";
export const FUENTES: { id: FuenteId; nodo: number; etq: string; icono: string; confianza: number; nota: string }[] = [
  { id: "ninguna", nodo: -1, etq: "Nadie lo desmiente", icono: "fa-ban", confianza: 0, nota: "Sin corrección, el rumor corre solo." },
  { id: "vecina", nodo: ID_VECINA, etq: "Una vecina", icono: "fa-user", confianza: 0.2, nota: "Tiene pocos contactos y poca autoridad en el tema." },
  { id: "maestra", nodo: ID_MAESTRA, etq: "La maestra de biología", icono: "fa-person-chalkboard", confianza: 0.4, nota: "Confían en ella docentes, alumnos y algunas familias." },
  { id: "salud", nodo: ID_SALUD, etq: "El centro de salud", icono: "fa-house-medical", confianza: 0.55, nota: "Fuente oficial con muchos seguidores en familias y en la colonia." },
];

export interface ConfigRumor {
  fuente: FuenteId;
  /** Oleadas (horas del modelo) que tarda en salir la corrección. */
  retraso: number;
  pausa: boolean;
  limite: boolean;
}

/** «Pausa para verificar»: reduce la probabilidad de reenviar el rumor (ilustrativo). */
export const EFECTO_PAUSA = 0.5;
/** A partir de 5 reenvíos, solo se puede mandar a un chat (WhatsApp, 2020). */
export const SALTOS_LIMITE = 5;
export const DESTINOS_LIMITE = 2;

export interface ResultadoRumor {
  eventos: Exposicion[];
  cree: number;
  dato: number;
  corregidas: number;
  sinEnterarse: number;
  duracion: number;
  /** Serie por oleada [creen, informadas] para la gráfica. */
  serie: [number, number][];
}

export function simularRumor(cfg: ConfigRumor, rnd: () => number): ResultadoRumor {
  const fuente = FUENTES.find((f) => f.id === cfg.fuente)!;
  const estado: EstadoRumor[] = Array.from({ length: N_PERSONAS }, () => 0 as EstadoRumor);
  // Veces que se ha reenviado cada mensaje hasta llegar a cada persona (uno por mensaje).
  const saltosR = new Int16Array(N_PERSONAS);
  const saltosV = new Int16Array(N_PERSONAS);
  const pR = P_DATO * FACTOR_FALSO * (cfg.pausa ? EFECTO_PAUSA : 1);
  // La cadena llega ya «reenviada muchas veces»: sus primeros reenvíos están a un paso del límite.
  for (const o of RUMOR.origenes) {
    estado[o] = 1;
    saltosR[o] = SALTOS_LIMITE - 1;
  }
  let fr: number[] = [...RUMOR.origenes];
  let fv: number[] = [];
  const eventos: Exposicion[] = [];
  const serie: [number, number][] = [];
  const contar = (): [number, number] => {
    let c = 0;
    let d = 0;
    for (let i = 0; i < N_PERSONAS; i++) {
      if (esPublica(i)) continue;
      if (estado[i] === 1) c++;
      else if (estado[i] === 2 || estado[i] === 3) d++;
    }
    return [c, d];
  };
  const destinos = (s: number, saltos: Int16Array) => {
    const vs = RED.vecinos[s]!;
    // Un solo chat: en el modelo, un chat pequeño con hasta DESTINOS_LIMITE contactos.
    if (cfg.limite && saltos[s]! >= SALTOS_LIMITE) {
      const a = Math.floor(rnd() * vs.length);
      return vs.length <= DESTINOS_LIMITE ? vs : Array.from({ length: DESTINOS_LIMITE }, (_, k) => vs[(a + k) % vs.length]!);
    }
    return vs;
  };
  for (let ola = 0; ola < MAX_OLEADAS; ola++) {
    if (fuente.nodo >= 0 && ola === cfg.retraso) {
      // Quien desmiente ya conoce el dato (si había creído el rumor, se corrige).
      estado[fuente.nodo] = estado[fuente.nodo] === 1 ? 3 : 2;
      eventos.push({ de: fuente.nodo, a: fuente.nodo, t: ola * SEG_OLEADA, nueva: true, reacciona: false, comparte: true, tipo: 1, estado: estado[fuente.nodo] });
      fv.push(fuente.nodo);
    }
    const nr: number[] = [];
    const nv: number[] = [];
    const t0 = ola * SEG_OLEADA + 0.1;
    fr.forEach((s, si) => {
      for (const j of destinos(s, saltosR)) {
        if (j === ID_SALUD) continue; // la fuente oficial no adopta ni reenvía el rumor
        if (rnd() >= ACTIVA_RUMOR) continue;
        let comparte = false;
        const nueva = estado[j] === 0;
        if (nueva) {
          estado[j] = 1;
          saltosR[j] = saltosR[s]! + 1;
          comparte = rnd() < pR;
          if (comparte) nr.push(j);
        }
        eventos.push({ de: s, a: j, t: t0 + ((si * 0.37) % 0.5) + rnd() * 0.25, nueva, reacciona: false, comparte, tipo: 0, estado: estado[j] });
      }
    });
    fv.forEach((s, si) => {
      for (const j of destinos(s, saltosV)) {
        if (rnd() >= ACTIVA_RUMOR) continue;
        let comparte = false;
        let nueva = false;
        if (estado[j] === 0) {
          estado[j] = 2;
          nueva = true;
        } else if (estado[j] === 1 && rnd() < Math.max(0.25, fuente.confianza)) {
          estado[j] = 3;
          nueva = true;
        }
        if (nueva) {
          saltosV[j] = saltosV[s]! + 1;
          comparte = rnd() < P_DATO;
          if (comparte) nv.push(j);
        }
        eventos.push({ de: s, a: j, t: t0 + ((si * 0.41) % 0.5) + rnd() * 0.25, nueva, reacciona: false, comparte, tipo: 1, estado: estado[j] });
      }
    });
    fr = nr;
    fv = nv;
    serie.push(contar());
    const pendienteFuente = fuente.nodo >= 0 && ola < cfg.retraso;
    if (fr.length === 0 && fv.length === 0 && !pendienteFuente) break;
  }
  eventos.sort((a, b) => a.t - b.t);
  const [cree, dato] = contar();
  let corregidas = 0;
  for (let i = 0; i < N_PERSONAS; i++) if (!esPublica(i) && estado[i] === 3) corregidas++;
  return { eventos, cree, dato, corregidas, sinEnterarse: N_HABITANTES - cree - dato, duracion: (eventos.at(-1)?.t ?? 0) + DUR_PULSO + 0.3, serie };
}

/**
 * Transiciones válidas del estado de una persona en la animación: nadie vuelve
 * atrás. Así el orden en que llegan los pulsos de una misma oleada no cambia el
 * resultado final.
 */
export const puedePasar = (actual: number, nuevo: number) => actual === 0 || (actual === 1 && nuevo === 3);

/** Métricas de la cascada contando solo los pulsos que ya llegaron al tiempo t. */
export function metricasAl(eventos: Exposicion[], t: number) {
  let alcance = 0;
  let impresiones = 0;
  let reacciones = 0;
  let compartidos = 0;
  let oleada = 0;
  for (const e of eventos) {
    if (e.t + DUR_PULSO > t) continue;
    impresiones++;
    oleada = Math.max(oleada, Math.floor(e.t / SEG_OLEADA) + 1);
    if (!e.nueva) continue;
    alcance++;
    if (e.reacciona) reacciones++;
    if (e.comparte) compartidos++;
  }
  return { alcance, impresiones, reacciones, compartidos, oleada };
}

/** Conteo del modo rumor al tiempo t (habitantes, sin cuentas institucionales). */
export function rumorAl(eventos: Exposicion[], t: number) {
  const estado = new Array<number>(N_PERSONAS).fill(0);
  if (eventos.length > 0) for (const o of RUMOR.origenes) estado[o] = 1;
  for (const e of eventos) {
    if (e.t + DUR_PULSO > t) continue;
    if (e.nueva && e.estado !== undefined && puedePasar(estado[e.a]!, e.estado)) estado[e.a] = e.estado;
  }
  let cree = 0;
  let dato = 0;
  let corregidas = 0;
  for (let i = 0; i < N_PERSONAS; i++) {
    if (esPublica(i)) continue;
    if (estado[i] === 1) cree++;
    else if (estado[i] === 2) dato++;
    else if (estado[i] === 3) {
      dato++;
      corregidas++;
    }
  }
  return { cree, dato, corregidas, sinEnterarse: N_HABITANTES - cree - dato };
}

/* ════════════════════════════════════════════════════════════════════════
 * TARJETA DE ESTRELLAS: ¿qué mide este dato?
 * ════════════════════════════════════════════════════════════════════════ */

export type Metrica = "alcance" | "impresiones" | "interaccion" | "impacto";
export const METRICAS: { id: Metrica; etq: string; icono: string; color: string }[] = [
  { id: "alcance", etq: "Alcance", icono: "fa-users", color: "#38bdf8" },
  { id: "impresiones", etq: "Impresiones", icono: "fa-eye", color: "#a78bfa" },
  { id: "interaccion", etq: "Interacción", icono: "fa-heart", color: "#f472b6" },
  { id: "impacto", etq: "Impacto", icono: "fa-seedling", color: "#34d399" },
];

export const METRICA_DEF: Record<Metrica, string> = {
  alcance: "Personas (o cuentas) DISTINTAS que vieron el contenido al menos una vez.",
  impresiones: "Veces que el contenido se mostró en pantalla, contando repeticiones de la misma persona.",
  interaccion: "Acciones sobre el contenido: reaccionar, comentar, compartir, guardar o responder.",
  impacto: "El cambio real que buscaba la comunicación, fuera de la plataforma.",
};

export const DATOS_METRICA: { texto: string; metrica: Metrica; porque: string }[] = [
  { texto: "La publicación apareció 1 240 veces en pantallas, contando repeticiones.", metrica: "impresiones", porque: "Cuenta apariciones, no personas: una misma cuenta puede sumar varias." },
  { texto: "Tu video lo vieron 830 cuentas distintas.", metrica: "alcance", porque: "«Cuentas distintas» es la definición de alcance." },
  { texto: "Recibió 96 reacciones, 14 comentarios y 31 compartidos.", metrica: "interaccion", porque: "Son acciones de la audiencia sobre la publicación." },
  { texto: "Las inscripciones de chicas al taller de robótica subieron de 12 % a 31 %.", metrica: "impacto", porque: "Es el cambio que la campaña buscaba, medido fuera de la red social." },
  { texto: "300 personas distintas pasaron frente al cartel del mercado.", metrica: "alcance", porque: "Cuenta personas distintas expuestas al mensaje, aunque sea impreso." },
  { texto: "Una misma persona vio tu historia tres veces y se contaron tres.", metrica: "impresiones", porque: "Si se cuentan las repeticiones, son impresiones." },
  { texto: "45 personas guardaron la infografía y 20 respondieron la encuesta.", metrica: "interaccion", porque: "Guardar y responder son formas de interactuar." },
  { texto: "80 hogares vaciaron sus cacharros el día de la jornada.", metrica: "impacto", porque: "Es la acción concreta que se pedía, no una reacción en pantalla." },
  { texto: "Tu publicación tuvo 5 000 «me gusta», pero nadie llegó a la jornada.", metrica: "interaccion", porque: "Muchos «me gusta» son interacción; sin asistencia, el impacto fue nulo." },
  { texto: "La escuela recolectó 38 kg de pilas en una semana.", metrica: "impacto", porque: "Es el resultado ambiental que buscaba la campaña." },
];

export function rondaMetricas(rnd: () => number, n = 6): number[] {
  const porTipo = (m: Metrica) => DATOS_METRICA.map((d, i) => ({ d, i })).filter((x) => x.d.metrica === m).map((x) => x.i);
  const baraja = (xs: number[]) => {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  };
  // Al menos uno de cada tipo; el resto al azar.
  const uno = METRICAS.map((m) => baraja(porTipo(m.id))[0]!);
  const resto = baraja(DATOS_METRICA.map((_, i) => i).filter((i) => !uno.includes(i))).slice(0, n - uno.length);
  return baraja([...uno, ...resto]);
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * CONTENIDO VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const PROPOSITO =
  "Utiliza herramientas de comunicación digital para difundir información, conocimientos, experiencias y aprendizajes, de acuerdo con su contexto personal, académico, social y ambiental.";

/** descripcion_extendida de la progresión CD-III-P02 — verbatim. */
export const CONTENIDOS_PROGRESION =
  "Produce contenidos digitales de calidad orientados a la transformación social con perspectiva de género e inclusión. Contenidos: criterios de calidad en la producción digital: claridad, accesibilidad, pertinencia, rigor; perspectiva de género en la producción de contenidos: representación, lenguaje incluyente, estereotipos; herramientas digitales para la creación: video, podcast, infografía, blog, redes; propiedad intelectual y licencias Creative Commons en la producción propia; ética en la difusión: privacidad, consentimiento, uso responsable de imágenes; diseño universal para el aprendizaje (DUA): accesibilidad digital; evaluación de impacto social de los contenidos producidos.";

/** Simulación A2 — verbatim. */
export const SIMULACION_A2 = {
  titulo: "Simulación: diseña una campaña digital inclusiva con perspectiva de género",
  descripcion:
    "Eres parte del equipo de comunicación digital de tu escuela o comunidad. El Comité Estudiantil te ha pedido diseñar una campaña digital para promover la participación igualitaria de mujeres y hombres en actividades extracurriculares (deportes, talleres de tecnología, ciencias, artes). Actualmente, los talleres de robótica y programación tienen menos del 15% de participación femenina. Tu campaña debe usar al menos dos plataformas digitales, tener perspectiva de género en su lenguaje e imágenes, y llegar a toda la comunidad escolar.",
  instrucciones: [
    "Define la audiencia objetivo de tu campaña: ¿a quiénes va dirigida principalmente? ¿Estudiantes, familias, docentes? ¿Hay un grupo específico al que quieres llegar (por ejemplo, niñas de primer grado)?",
    "Elige las plataformas digitales que usarás (máximo dos) y justifica por qué son las más adecuadas para llegar a tu audiencia en el contexto de tu escuela.",
    "Diseña el mensaje principal de tu campaña: ¿cuál es el nombre o eslogan? ¿Qué imagen o video imaginas como contenido central? ¿Cómo aseguras que el lenguaje y las imágenes sean incluyentes y eviten estereotipos de género?",
    "Define los indicadores de impacto: ¿cómo sabrás si tu campaña fue exitosa? Propón al menos dos indicadores concretos y medibles (por ejemplo: porcentaje de inscripciones femeninas en talleres de tecnología antes y después de la campaña).",
    "Identifica posibles obstáculos o resistencias que podría enfrentar tu campaña (por ejemplo: prejuicios de familias, falta de acceso a dispositivos, contenido que se percibe como 'político') y propón cómo los abordarías.",
  ],
  preguntas: [
    "¿Qué diferencias encontraste entre diseñar una campaña 'neutral' y una campaña con perspectiva de género? ¿Qué decisiones cambiaron?",
    "¿Cómo influyó el contexto específico de tu escuela o comunidad en las decisiones que tomaste sobre plataforma, lenguaje e imágenes?",
    "¿Qué estereotipos de género tuviste que cuestionar activamente al diseñar los mensajes y las imágenes de tu campaña?",
    "¿Crees que una campaña digital es suficiente para cambiar la participación de género en los talleres? ¿Qué otras acciones complementarias serían necesarias?",
  ],
};

/** Reflexión A3 — verbatim. */
export const REFLEXION_A3 =
  "¿Cómo puedo asegurar que los contenidos digitales que produzco no reproducen estereotipos de género y contribuyen activamente a la inclusión? Reflexiona sobre decisiones concretas de lenguaje, representación visual, selección de temas y formas de interacción con la audiencia.";

/** Preguntas del video A8 «Herramientas de comunicación digital para difundir información» — verbatim. */
export const VIDEO_A8 = {
  titulo: "Herramientas de comunicación digital para difundir información",
  abierta: "¿Qué herramienta de comunicación digital usarías para compartir un aprendizaje con tu comunidad y por qué?",
  vf: "La elección de una herramienta digital para difundir información debe considerar el contexto y la audiencia a la que se dirige.",
};

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  {
    termino: "Perspectiva de género",
    definicion: "Enfoque analítico que examina cómo las normas, roles y expectativas sociales asignadas por género producen desigualdades. En la producción digital, implica crear contenidos que cuestionen estereotipos y promuevan relaciones más equitativas.",
    ejemplo: "Un podcast sobre carreras STEM que entrevista principalmente a mujeres científicas y tecnólogas aplica perspectiva de género al visibilizar referentes que suelen estar subrepresentados.",
  },
  {
    termino: "Brecha digital de género",
    definicion: "Desigualdad en el acceso, uso, habilidades y participación en entornos digitales entre personas de diferentes géneros. Afecta especialmente a mujeres y disidencias en comunidades rurales, de bajos ingresos y en países en desarrollo.",
    ejemplo: "En México, estudios han mostrado que las mujeres tienen menor acceso a dispositivos propios y menor participación en programas de formación tecnológica avanzada, lo que perpetúa desigualdades laborales en el sector TIC.",
  },
  {
    termino: "Contenido digital de calidad",
    definicion: "Producción digital que es veraz, accesible, relevante para su audiencia, éticamente producida (cita fuentes, respeta derechos de autor), estéticamente cuidada y orientada a un propósito comunicativo claro.",
    ejemplo: "Una infografía sobre violencia de género que cita estadísticas oficiales, usa lenguaje claro, tiene contraste visual adecuado y proporciona recursos de ayuda es un contenido de calidad.",
  },
  {
    termino: "Accesibilidad digital",
    definicion: "Diseño de contenidos y plataformas que pueden ser usados por todas las personas, independientemente de sus capacidades físicas, sensoriales o cognitivas. Incluye subtítulos, descripciones de audio, contraste visual y lenguaje sencillo.",
    ejemplo: "Añadir texto alternativo (alt text) a las imágenes de un sitio web permite que personas con discapacidad visual, que usan lectores de pantalla, accedan al contenido de las imágenes.",
  },
  {
    termino: "Transformación social digital",
    definicion: "Uso de herramientas y plataformas digitales para visibilizar problemáticas sociales, movilizar comunidades, amplificar voces marginadas y proponer soluciones colectivas a injusticias estructurales.",
    ejemplo: "Campañas como #MeToo o #NiUnaMenos usaron redes sociales para visibilizar la violencia de género y generar movimientos de incidencia política a escala global.",
  },
  {
    termino: "Lenguaje incluyente",
    definicion: "Uso del lenguaje que evita la invisibilización o estereotipación de géneros. Puede incluir formas no binarias (la/el directora/director), términos neutros (estudiantado, comunidad) o el uso del género no marcado según contexto.",
    ejemplo: "En lugar de 'los alumnos', usar 'el alumnado' o 'las y los alumnos' incluye a todas las personas sin asumir un género por defecto.",
  },
];

export const ACTIVIDAD_A5 =
  "Elige una problemática social de tu comunidad (violencia, desigualdad, falta de espacios seguros, acceso a servicios). Diseña el concepto de un contenido digital (especifica formato: video, infografía, podcast, etc.) que lo aborde con perspectiva de género e inclusión. Describe: (a) la problemática, (b) la audiencia, (c) el formato y por qué lo elegiste, (d) al menos dos estrategias de accesibilidad que incluirías.";

/** Quiz A4 (verdadero/falso) como reto evaluable — enunciados y retroalimentación verbatim. */
export const QUIZ_A4: QuizEvaluable = {
  titulo: "Verdadero o Falso — Contenidos digitales con perspectiva de género",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "La perspectiva de género en la producción de contenidos digitales implica cuestionar y desafiar los estereotipos de género reproducidos en medios y plataformas.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto. Incorporar perspectiva de género significa identificar y cuestionar representaciones que perpetúan desigualdades, así como crear contenidos que promuevan la equidad.",
    },
    {
      enunciado: "Un contenido digital inclusivo solo necesita estar disponible en formato de texto, ya que todos los usuarios pueden leer.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "Falso. La inclusión digital implica ofrecer contenidos accesibles para personas con diferentes capacidades: subtítulos para sordos, descripciones de audio para ciegos, lenguaje claro para personas con diferentes niveles de alfabetización, entre otros.",
    },
    {
      enunciado: "La brecha digital de género se refiere a las desigualdades en el acceso, uso y apropiación de las tecnologías digitales entre hombres y mujeres.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto. La brecha digital de género abarca no solo el acceso a dispositivos o internet, sino también las habilidades digitales, la participación en espacios tecnológicos y la representación en carreras TIC.",
    },
    {
      enunciado: "Publicar un video en YouTube con lenguaje inclusivo y subtítulos automáticos es suficiente para garantizar que el contenido sea plenamente inclusivo.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "Falso. Los subtítulos automáticos suelen cometer errores, especialmente con acentos regionales. La inclusión plena requiere revisar subtítulos, asegurar accesibilidad visual, usar lenguaje claro y considerar las condiciones de conectividad de la audiencia.",
    },
    {
      enunciado: "La calidad de un contenido digital orientado a la transformación social se mide únicamente por el número de visualizaciones o reproducciones que obtiene.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "Falso. La calidad y el impacto social de un contenido no se reducen a métricas de viralidad. Un contenido puede tener alto impacto transformador en una comunidad específica con un alcance moderado pero bien dirigido.",
    },
  ],
};

/** Actividad A6 «Completa los espacios» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "CD-III-P02-A6 · Completa los espacios — Producción digital con perspectiva de género",
  instrucciones: "Completa los huecos con el término o concepto correcto.",
  partes: [
    "La desigualdad en el acceso y uso de tecnologías entre géneros se denomina brecha digital de ",
    ". Diseñar contenidos digitales que puedan ser utilizados por personas con distintas capacidades se llama ",
    " digital. Usar el término 'estudiantado' en lugar de 'los alumnos' es un ejemplo de lenguaje ",
    ". Un contenido digital que cita fuentes confiables, respeta derechos de autor y tiene propósito comunicativo claro se considera de ",
    ".",
  ],
  huecos: [
    { respuesta: "género", alternativas: [], pista: "La desigualdad tecnológica entre hombres y mujeres se llama brecha digital de ___." },
    { respuesta: "accesibilidad", alternativas: ["accesible"], pista: "El principio que busca que todos puedan usar los contenidos digitales sin importar su capacidad se llama ___." },
    { respuesta: "incluyente", alternativas: ["inclusivo", "no sexista"], pista: "El lenguaje que evita invisibilizar o estereotipar géneros se llama lenguaje ___." },
    { respuesta: "calidad", alternativas: [], pista: "Un contenido veraz, accesible y éticamente producido es un contenido de ___." },
  ],
};

export const FUENTE =
  "CEN Bachillerato — CD-III, progresión 2: propósito y contenidos de la progresión, simulación A2, reflexión A3, verdadero/falso A4, glosario A5, completa el texto A6 y video A8. Datos: INEGI ENDUTIH 2024; INEGI Censo 2020; Vosoughi, Roy y Aral, Science 359 (2018); WhatsApp (2020); W3C WCAG 2.2; Kempe, Kleinberg y Tardos (2003).";

export const PROBLEMA =
  "Publicar no es lo mismo que comunicar. Un mensaje importante puede quedarse en 20 pantallas o llegar a toda la comunidad; puede verse mil veces sin que nadie haga nada, o dejar fuera justo a quien más lo necesita. Aquí lanzas publicaciones en una red de 150 personas, diseñas una campaña con máximo dos canales y compites contra un rumor que corre más rápido que la verdad.";

export const INSTRUCCIONES: string[] = [
  "En Cascada de compartidos, elige desde qué cuenta, en qué formato y a qué hora publicas; lanza y mira la cascada. Compara alcance, impresiones e interacción y calcula la tasa de interacción.",
  "En Campaña comunitaria, elige un caso, marca la audiencia, escoge máximo dos canales, activa la accesibilidad y elige dos indicadores. Lanza y revisa a quién llegó y a quién no.",
  "En Rumor contra dato, suelta primero el rumor sin hacer nada; después decide quién lo desmiente, qué tan rápido y qué frenos activar hasta que el dato verificado llegue a más personas.",
  "Clasifica datos en «¿Qué mide este dato?» para ganar estrellas, aprueba el verdadero o falso A4 y completa el texto A6.",
];

export const IDEAS: string[] = [
  "Alcance = personas distintas; impresiones = veces mostrada; interacción = acciones. Las impresiones siempre son iguales o mayores que el alcance.",
  "La mayoría de las publicaciones no se vuelven virales: cada persona que la ve la comparte con poca probabilidad, y la cascada se apaga.",
  "Desde qué cuenta publicas (sus seguidores y a qué grupos llegan) pesa más que casi cualquier otra decisión.",
  "Publicar cuando tu audiencia está conectada cambia cuántas personas la ven.",
  "El mejor canal depende de la audiencia y su contexto: sin internet no hay WhatsApp; para personas sordas la radio no sirve.",
  "La accesibilidad (texto alternativo, subtítulos revisados, contraste, lenguaje claro) cambia a QUIÉN llega el mensaje.",
  "Un indicador de impacto mide el cambio buscado; los «me gusta» no lo miden.",
  "Lo falso se comparte más; frenarlo exige verificar antes de reenviar, desmentir pronto y desde una fuente confiable.",
];
