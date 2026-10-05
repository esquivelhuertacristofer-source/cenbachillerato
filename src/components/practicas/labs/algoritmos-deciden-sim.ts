/**
 * Modelo del SIMULADOR de recomendación (lab «algoritmos-deciden»).
 *
 * Todo es FICTICIO: la plataforma «Rumbo», la usuaria «Dani», los canales y
 * TODAS las cifras son valores de simulación para entender cómo un algoritmo
 * de recomendación arma un feed; no describen ninguna plataforma real.
 *
 * El modelo es DETERMINISTA y transparente (sin azar oculto):
 *   puntaje   = promedio ponderado de las tres señales que el algoritmo mira
 *               (reacción emocional, parecido a lo que ya viste, fiabilidad)
 *   objetivo  = con qué se «entrena»: cambia los pesos (tiempo → premia lo
 *               emocional; satisfacción → premia lo fiable)
 *   variedad  = al ordenar, resta puntos a un tema que ya salió arriba
 *   datos     = si se apaga el historial o la lectura de emociones, esa señal
 *               vale 50 para todos (el algoritmo «no sabe»)
 * Los medidores se calculan SIEMPRE con los 4 primeros contenidos (lo que cabe
 * en la pantalla) y con las características reales de cada video.
 */

export type Tema = "deportes" | "ciencia" | "cocina" | "noticias" | "musica";

export const TEMAS: Record<Tema, { nombre: string; icono: string }> = {
  deportes: { nombre: "Deportes", icono: "fa-futbol" },
  ciencia: { nombre: "Ciencia", icono: "fa-flask" },
  cocina: { nombre: "Cocina", icono: "fa-utensils" },
  noticias: { nombre: "Noticias del barrio", icono: "fa-newspaper" },
  musica: { nombre: "Música", icono: "fa-music" },
};

export interface Clip {
  id: string;
  /** Clave de la imagen: /media/labs-sim/algoritmos-deciden/<clave>.webp */
  clave: string;
  titulo: string;
  canal: string;
  tema: Tema;
  /** 0–100: cuánta reacción emocional provoca (indignación, miedo, euforia). */
  emo: number;
  /** 0–100: qué tanto se parece a lo que Dani ya vio. */
  afi: number;
  /** 0–100: fiabilidad de la fuente (menos de 50 = engañoso o sin fuente). */
  fiab: number;
  /** Por qué se ve así para el algoritmo (se muestra en la tarjeta). */
  nota: string;
}

export const CLIPS: Clip[] = [
  { id: "gol", clave: "gol-barrio", titulo: "Gol imposible en la cancha del barrio", canal: "Canal Cancha Viva", tema: "deportes", emo: 70, afi: 95, fiab: 90, nota: "Es justo lo que Dani suele ver." },
  { id: "agua", clave: "agua-llave", titulo: "«¡Te lo ocultan!» El agua de la llave ya no sirve", canal: "Alertas del Valle", tema: "noticias", emo: 95, afi: 70, fiab: 10, nota: "Provoca miedo y no cita ninguna fuente." },
  { id: "lluvia", clave: "lluvia-tarde", titulo: "Por qué llueve casi siempre por la tarde", canal: "Ciencia en 3 minutos", tema: "ciencia", emo: 25, afi: 30, fiab: 95, nota: "Explica con calma y con fuentes." },
  { id: "tamales", clave: "tamales", titulo: "Tamales de rajas en diez minutos", canal: "Cocina de Doña Lupe", tema: "cocina", emo: 35, afi: 40, fiab: 85, nota: "Contenido útil, poco emocionante." },
  { id: "consejo", clave: "consejo-vecinal", titulo: "Consejo vecinal explica el proyecto del parque", canal: "Voz del Barrio TV", tema: "noticias", emo: 30, afi: 25, fiab: 90, nota: "Informa con datos y cita al consejo." },
  { id: "pelea", clave: "pelea-partido", titulo: "Pelea e insultos en el partido de ayer", canal: "Canal Cancha Viva", tema: "deportes", emo: 90, afi: 90, fiab: 55, nota: "Muy emocional, mezcla hechos y chisme." },
  { id: "banda", clave: "banda-escolar", titulo: "La banda de la secundaria estrena su primera canción", canal: "Rumbo Música", tema: "musica", emo: 55, afi: 35, fiab: 90, nota: "Positivo, pero de un tema nuevo para Dani." },
  { id: "culpa", clave: "barrio-rivalidad", titulo: "«Los de la otra colonia tienen la culpa de todo»", canal: "Alertas del Valle", tema: "noticias", emo: 92, afi: 65, fiab: 15, nota: "Genera enojo y divide a los vecinos." },
];

export type Objetivo = "tiempo" | "satisfaccion" | "equilibrado";

export const OBJETIVOS: Record<Objetivo, { etiqueta: string; icono: string; emo: number; cal: number; explica: string }> = {
  tiempo: { etiqueta: "Maximizar el tiempo en la plataforma", icono: "fa-hourglass-half", emo: 1.5, cal: 0.5, explica: "Entrenado con «cuánto tiempo se queda la gente»: premia lo que engancha." },
  satisfaccion: { etiqueta: "Maximizar lo que la gente dice que le sirvió", icono: "fa-face-smile", emo: 0.7, cal: 1.3, explica: "Entrenado con encuestas de utilidad: premia lo confiable." },
  equilibrado: { etiqueta: "Equilibrado", icono: "fa-scale-balanced", emo: 1, cal: 1, explica: "Sin sesgo hacia ninguna señal." },
};

export interface Config {
  /** Pesos 0–100. */
  emo: number;
  afi: number;
  cal: number;
  /** 0–100: castigo a repetir tema. */
  div: number;
  historial: boolean;
  emociones: boolean;
  objetivo: Objetivo;
}

/** Cómo arranca «Rumbo»: pensada para enganchar. */
export const DEFECTO: Config = { emo: 60, afi: 60, cal: 10, div: 0, historial: true, emociones: true, objetivo: "tiempo" };

export const PRESETS: { id: string; etiqueta: string; icono: string; cfg: Config }[] = [
  { id: "engancha", etiqueta: "Que enganche", icono: "fa-fire", cfg: DEFECTO },
  { id: "equilibrado", etiqueta: "Equilibrado", icono: "fa-scale-balanced", cfg: { emo: 50, afi: 50, cal: 50, div: 40, historial: true, emociones: true, objetivo: "equilibrado" } },
  { id: "sano", etiqueta: "Diverso y fiable", icono: "fa-seedling", cfg: { emo: 20, afi: 30, cal: 90, div: 80, historial: true, emociones: false, objetivo: "satisfaccion" } },
];

/** Cuántos contenidos caben en la pantalla de Dani. */
export const PANTALLA = 4;

export interface Posicion {
  clip: Clip;
  /** Puntaje final con el que se ordenó (después de la variedad). */
  puntaje: number;
  /** Qué señal aportó más al puntaje base. */
  dominante: "emo" | "afi" | "cal";
}

function pesos(cfg: Config) {
  const o = OBJETIVOS[cfg.objetivo];
  return { e: cfg.emo * o.emo, a: cfg.afi, c: cfg.cal * o.cal };
}

/** Ordena los 8 contenidos con la configuración dada. */
export function ordenar(cfg: Config): Posicion[] {
  const w = pesos(cfg);
  const suma = w.e + w.a + w.c;
  const base = (c: Clip) => {
    const e = cfg.emociones ? c.emo : 50;
    const a = cfg.historial ? c.afi : 50;
    if (suma <= 0) return { total: 50, dominante: "cal" as const };
    const pe = (w.e * e) / suma;
    const pa = (w.a * a) / suma;
    const pc = (w.c * c.fiab) / suma;
    const dominante = pe >= pa && pe >= pc ? ("emo" as const) : pa >= pc ? ("afi" as const) : ("cal" as const);
    return { total: pe + pa + pc, dominante };
  };

  const restantes = [...CLIPS];
  const salida: Posicion[] = [];
  while (restantes.length > 0) {
    let mejor = -1;
    let mejorP = -Infinity;
    let mejorB = base(restantes[0]!);
    restantes.forEach((c, i) => {
      const b = base(c);
      const repetidos = salida.filter((p) => p.clip.tema === c.tema).length;
      const p = b.total - (cfg.div / 100) * 40 * repetidos;
      if (p > mejorP + 1e-9) {
        mejorP = p;
        mejor = i;
        mejorB = b;
      }
    });
    const [clip] = restantes.splice(mejor, 1);
    salida.push({ clip: clip!, puntaje: Math.round(mejorP * 10) / 10, dominante: mejorB.dominante });
  }
  return salida;
}

export interface Medidores {
  /** Tiempo que Dani se quedaría (simulación), 0–100. */
  tiempo: number;
  /** Burbuja de filtro, 0–100. */
  burbuja: number;
  /** Porcentaje de los 4 primeros que son engañosos (fiabilidad < 50). */
  desinfo: number;
  /** Cuántos temas distintos hay en la pantalla. */
  temas: number;
  /** Cuántos engañosos hay en la pantalla. */
  enganosos: number;
}

export function medir(orden: Posicion[]): Medidores {
  const top = orden.slice(0, PANTALLA).map((p) => p.clip);
  const n = top.length;
  const tiempo = Math.round(top.reduce((s, c) => s + 0.6 * c.emo + 0.4 * c.afi, 0) / n);
  const temas = new Set(top.map((c) => c.tema)).size;
  const afiMedia = top.reduce((s, c) => s + c.afi, 0) / n;
  const burbuja = Math.round(0.5 * afiMedia + 0.5 * (100 * (n - temas)) / (n - 1));
  const enganosos = top.filter((c) => c.fiab < 50).length;
  return { tiempo, burbuja, desinfo: Math.round((100 * enganosos) / n), temas, enganosos };
}

export type Veredicto = "engancha" | "sano" | "mixto";

export function veredicto(m: Medidores): { id: Veredicto; texto: string } {
  if (m.desinfo === 0 && m.burbuja <= 45) return { id: "sano", texto: "Feed diverso y confiable: Dani ve de todo y nada engañoso." };
  if (m.tiempo >= 75 && (m.desinfo >= 50 || m.burbuja >= 65)) return { id: "engancha", texto: "Feed que engancha: mucho tiempo, pero a costa de burbuja o desinformación." };
  return { id: "mixto", texto: "Feed intermedio: sigue ajustando para ver qué se gana y qué se pierde." };
}

/** Frases que explican POR QUÉ el feed quedó así (máximo 4). */
export function explicar(cfg: Config, orden: Posicion[], m: Medidores): string[] {
  const out: string[] = [];
  const primero = orden[0]!;
  const razon = primero.dominante === "emo" ? "su carga emocional" : primero.dominante === "afi" ? "lo parecido que es a lo que Dani ya vio" : "la fiabilidad de su fuente";
  out.push(`«${primero.clip.titulo}» queda primero por ${razon}: con estos pesos esa señal pesa más.`);

  if (m.enganosos > 0) {
    out.push(`${m.enganosos} de los ${PANTALLA} primeros son engañosos. Lo indignante genera reacciones, y si el peso de la fiabilidad es bajo, el algoritmo no lo distingue de lo verdadero.`);
  } else {
    out.push("Ningún contenido engañoso llega a la pantalla: al pesar la fiabilidad, lo que no cita fuentes baja.");
  }

  if (m.burbuja >= 65) {
    out.push(`Burbuja alta (${m.temas} ${m.temas === 1 ? "tema" : "temas"} en pantalla): casi todo se parece a lo que Dani ya veía y confirma lo que ya piensa.`);
  } else if (m.burbuja <= 45) {
    out.push(`Burbuja baja (${m.temas} temas distintos): castigar la repetición abre la pantalla a ideas nuevas.`);
  }

  if (!cfg.historial) out.push("Sin historial, el algoritmo ya no sabe qué le gusta a Dani: la señal de parecido vale lo mismo para todos.");
  else if (!cfg.emociones) out.push("Sin medir emociones, el algoritmo pierde la pista de lo que engancha y se apoya más en lo demás.");

  if (cfg.objetivo === "tiempo" && m.tiempo >= 75) out.push("Con el objetivo «maximizar el tiempo» el tiempo en la plataforma sube: ese es el negocio, no tu bienestar.");
  if (cfg.objetivo === "satisfaccion" && m.tiempo < 60) out.push("Con el objetivo de utilidad baja el tiempo en la plataforma: por eso rara vez es el objetivo elegido.");
  return out.slice(0, 4);
}
