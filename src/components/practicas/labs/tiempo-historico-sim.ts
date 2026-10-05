/**
 * Modelo del TALLER DE LÍNEA DEL TIEMPO (lab «tiempo-historico»).
 *
 * Los sucesos son hechos históricos reales, los de la infografía y el glosario
 * de la progresión (caída de México-Tenochtitlan, Independencia, Revolución,
 * Constitución, Revolución Francesa de 1789 a 1799) más tres procesos que los
 * enmarcan (época colonial, guerra de Independencia, Porfiriato). Las fechas
 * son las que se enseñan en el bachillerato; donde la historiografía discute el
 * cierre (la Revolución), la nota lo dice. No hay cifras inventadas.
 *
 * El modelo es DETERMINISTA:
 *   posición mostrada = año que puso el alumno, redondeado a la escala vigente
 *   duración          = fin − inicio (la real, no la que adivina el alumno)
 *   coherencia        = promedio, sobre todos los pares de sucesos colocados,
 *                       de acertar el ORDEN y de acertar si fueron SIMULTÁNEOS
 *   cortes            = cuántos procesos atraviesa una línea de periodización
 */

export const ANIO_MIN = 1500;
export const ANIO_MAX = 1930;

export type Duracion = "larga" | "mediana" | "corta";

export interface Suceso {
  id: string;
  /** Clave de la imagen: /media/labs-sim/tiempo-historico/<clave>.webp */
  clave: string;
  nombre: string;
  inicio: number;
  fin: number;
  icono: string;
  /** Por qué esas fechas y qué tipo de duración es (se muestra al colocar). */
  nota: string;
}

export const SUCESOS: Suceso[] = [
  { id: "tenochtitlan", clave: "caida-tenochtitlan", nombre: "Caída de México-Tenochtitlan", inicio: 1521, fin: 1521, icono: "fa-landmark", nota: "Un suceso concreto de 1521: es tiempo corto." },
  { id: "colonial", clave: "epoca-colonial", nombre: "Época colonial", inicio: 1521, fin: 1821, icono: "fa-church", nota: "Tres siglos, de la caída de Tenochtitlan a la Independencia: una estructura de larga duración." },
  { id: "francesa", clave: "revolucion-francesa", nombre: "Revolución Francesa", inicio: 1789, fin: 1799, icono: "fa-people-group", nota: "De 1789 a 1799: diez años, mediana duración. Ocurrió mientras México aún era colonia." },
  { id: "guerra", clave: "guerra-independencia", nombre: "Guerra de Independencia", inicio: 1810, fin: 1821, icono: "fa-flag", nota: "Un proceso de 1810 a 1821: mediana duración. La Independencia (1821) es su cierre." },
  { id: "porfiriato", clave: "porfiriato-tren", nombre: "Porfiriato", inicio: 1876, fin: 1911, icono: "fa-train", nota: "Treinta y cinco años de un mismo gobierno: una coyuntura de mediana duración que termina con la Revolución ya en marcha." },
  { id: "revolucion", clave: "revolucion-mexicana", nombre: "Revolución Mexicana", inicio: 1910, fin: 1920, icono: "fa-fire-flame-curved", nota: "Comienza en 1910; se suele cerrar hacia 1920. Una década: mediana duración." },
  { id: "constitucion", clave: "constitucion-1917", nombre: "Constitución de 1917", inicio: 1917, fin: 1917, icono: "fa-scroll", nota: "Se promulga en 1917, en plena Revolución: un suceso corto dentro de un proceso largo." },
];

export const duracionDe = (s: Suceso): Duracion => {
  const d = s.fin - s.inicio;
  return d >= 100 ? "larga" : d >= 2 ? "mediana" : "corta";
};

export const DURACION_TXT: Record<Duracion, { nombre: string; regla: string; col: string }> = {
  larga: { nombre: "Larga duración", regla: "siglos", col: "#B58CFF" },
  mediana: { nombre: "Mediana duración", regla: "años o décadas", col: "#5BC8FF" },
  corta: { nombre: "Tiempo corto", regla: "un suceso concreto", col: "#FFC75A" },
};

/* ── Escalas ──────────────────────────────────────────────────────────── */

export type Escala = "anio" | "decada" | "siglo";

export const ESCALAS: Record<Escala, { etiqueta: string; paso: number; marca: number; tolerancia: number }> = {
  anio: { etiqueta: "Año", paso: 1, marca: 5, tolerancia: 3 },
  decada: { etiqueta: "Década", paso: 10, marca: 10, tolerancia: 5 },
  siglo: { etiqueta: "Siglo", paso: 100, marca: 100, tolerancia: 50 },
};

export const ajustar = (anio: number, escala: Escala): number => {
  const p = ESCALAS[escala].paso;
  const a = Math.round(anio / p) * p;
  return Math.min(ANIO_MAX, Math.max(ANIO_MIN, a));
};

/** Marcas (rayitas) del eje según la escala. */
export function marcas(escala: Escala): number[] {
  const m = ESCALAS[escala].marca;
  const out: number[] = [];
  for (let a = Math.ceil(ANIO_MIN / m) * m; a <= ANIO_MAX; a += m) out.push(a);
  return out;
}

/** Marcas con número escrito: cada siglo, o cada 50 años en las escalas finas. */
export function etiquetas(escala: Escala): number[] {
  const m = escala === "siglo" ? 100 : 50;
  return marcas(escala).filter((a) => a % m === 0);
}

/* ── Periodizaciones ──────────────────────────────────────────────────── */

export type Periodo = "siglos" | "etapas" | "ninguna";

export interface Banda {
  desde: number;
  hasta: number;
  nombre: string;
}

export const PERIODIZACIONES: Record<Periodo, { etiqueta: string; icono: string; cortes: number[]; bandas: Banda[]; explica: string }> = {
  siglos: {
    etiqueta: "Por siglos",
    icono: "fa-calendar",
    cortes: [1600, 1700, 1800, 1900],
    bandas: [
      { desde: 1500, hasta: 1600, nombre: "XVI" },
      { desde: 1600, hasta: 1700, nombre: "XVII" },
      { desde: 1700, hasta: 1800, nombre: "XVIII" },
      { desde: 1800, hasta: 1900, nombre: "XIX" },
      { desde: 1900, hasta: ANIO_MAX, nombre: "XX" },
    ],
    explica: "Corta cada cien años sin importar lo que pasó: es cómoda, pero parte los procesos por la mitad.",
  },
  etapas: {
    etiqueta: "Por etapas de México",
    icono: "fa-layer-group",
    cortes: [1521, 1821, 1910],
    bandas: [
      { desde: 1500, hasta: 1521, nombre: "Antes de 1521" },
      { desde: 1521, hasta: 1821, nombre: "Colonia" },
      { desde: 1821, hasta: 1910, nombre: "México independiente" },
      { desde: 1910, hasta: ANIO_MAX, nombre: "Revolución y después" },
    ],
    explica: "Corta donde cambia algo importante para el país: sigue los acontecimientos, no el calendario.",
  },
  ninguna: {
    etiqueta: "Sin periodizar",
    icono: "fa-ruler-horizontal",
    cortes: [],
    bandas: [],
    explica: "Solo años corridos: se ve todo, pero no se agrupa en etapas con sentido.",
  },
};

/* ── Colocación y medidas ─────────────────────────────────────────────── */

/** Lo que el alumno puso: id del suceso → año de inicio (ya redondeado a la escala en que lo puso). */
export type Colocados = Record<string, number>;

export interface Barra {
  suceso: Suceso;
  duracion: Duracion;
  /** Inicio mostrado (redondeado a la escala actual). */
  desde: number;
  /** Fin mostrado = inicio mostrado + duración real. */
  hasta: number;
  /** ¿El año puesto cae dentro de la tolerancia de la escala? */
  bien: boolean;
  /** Error en años (signo: + = lo pusiste después). */
  error: number;
}

export function barras(colocados: Colocados, escala: Escala): Barra[] {
  const out: Barra[] = [];
  for (const s of SUCESOS) {
    const crudo = colocados[s.id];
    if (crudo === undefined) continue;
    const desde = ajustar(crudo, escala);
    const error = desde - s.inicio;
    out.push({
      suceso: s,
      duracion: duracionDe(s),
      desde,
      hasta: Math.min(ANIO_MAX, desde + (s.fin - s.inicio)),
      bien: Math.abs(error) <= ESCALAS[escala].tolerancia,
      error,
    });
  }
  return out;
}

const traslapan = (a: { desde: number; hasta: number }, b: { desde: number; hasta: number }) => a.desde <= b.hasta && b.desde <= a.hasta;

export interface Par {
  a: Suceso;
  b: Suceso;
  /** ¿Se traslapan en la realidad? */
  realSimultaneos: boolean;
  /** ¿Se traslapan como los dejó el alumno? */
  vistoSimultaneos: boolean;
  /** 1 = orden bien, 0.5 = empate (a esta escala no se distinguen), 0 = al revés. */
  orden: number;
  ordenReal: number;
}

export function pares(bs: Barra[]): Par[] {
  const out: Par[] = [];
  for (let i = 0; i < bs.length; i++) {
    for (let j = i + 1; j < bs.length; j++) {
      const A = bs[i]!;
      const B = bs[j]!;
      const real = Math.sign(A.suceso.inicio - B.suceso.inicio);
      const visto = Math.sign(A.desde - B.desde);
      const orden = real === 0 ? 1 : visto === 0 ? 0.5 : visto === real ? 1 : 0;
      out.push({
        a: A.suceso,
        b: B.suceso,
        realSimultaneos: traslapan({ desde: A.suceso.inicio, hasta: A.suceso.fin }, { desde: B.suceso.inicio, hasta: B.suceso.fin }),
        vistoSimultaneos: traslapan(A, B),
        orden,
        ordenReal: real,
      });
    }
  }
  return out;
}

/** Coherencia 0–100 de lo colocado, o null si hay menos de dos sucesos. */
export function coherencia(bs: Barra[]): number | null {
  const ps = pares(bs);
  if (ps.length === 0) return null;
  const suma = ps.reduce((s, p) => s + (p.orden + (p.realSimultaneos === p.vistoSimultaneos ? 1 : 0)) / 2, 0);
  return Math.round((100 * suma) / ps.length);
}

/** Pares que a esta escala ya no se pueden ordenar (caen en la misma marca aunque no empezaron juntos). */
export function empates(bs: Barra[]): Par[] {
  return pares(bs).filter((p) => p.orden === 0.5);
}

/** Nombres de los procesos que una línea de corte atraviesa de parte a parte. */
export function cortados(bs: Barra[], periodo: Periodo): { suceso: Suceso; cortes: number }[] {
  const cs = PERIODIZACIONES[periodo].cortes;
  return bs
    .map((b) => ({ suceso: b.suceso, cortes: cs.filter((c) => b.desde < c && c < b.hasta).length }))
    .filter((x) => x.cortes > 0);
}

/** Pares de sucesos que realmente coincidieron en el tiempo (entre los colocados). */
export function simultaneosReales(bs: Barra[]): Par[] {
  return pares(bs).filter((p) => p.realSimultaneos);
}

/** Frase de retroalimentación al colocar un suceso. */
export function retro(b: Barra): string {
  const s = b.suceso;
  if (b.bien) {
    return `Bien: ${s.nombre} empieza en ${s.inicio}. ${s.nota}`;
  }
  const quien = b.error > 0 ? "después" : "antes";
  return `${s.nombre} empieza en ${s.inicio}; lo pusiste ${Math.abs(b.error)} años ${quien}. ${s.nota}`;
}

/** Texto de lo que pasa en el taller (máximo 4 frases que explican por qué). */
export function explicarTaller(bs: Barra[], escala: Escala, periodo: Periodo): string[] {
  const out: string[] = [];
  if (bs.length < 2) {
    out.push("Elige un suceso, mueve el cursor sobre el eje y pulsa «Colocar». Con dos sucesos ya se puede medir la coherencia.");
    return out;
  }
  const sim = simultaneosReales(bs);
  if (sim.length > 0) {
    const p = sim[0]!;
    out.push(`Coincidieron en el tiempo: ${p.a.nombre} y ${p.b.nombre}. Un mismo momento convive con procesos largos y sucesos cortos.`);
  }
  const em = empates(bs);
  if (em.length > 0) {
    const p = em[0]!;
    out.push(`A escala de ${ESCALAS[escala].etiqueta.toLowerCase()} ${p.a.nombre} y ${p.b.nombre} caen en la misma marca: ya no se distingue cuál fue antes. Una escala gruesa borra el orden fino.`);
  }
  const cs = cortados(bs, periodo);
  if (periodo !== "ninguna") {
    out.push(
      cs.length === 0
        ? `La periodización ${PERIODIZACIONES[periodo].etiqueta.toLowerCase()} no parte ningún proceso de los que colocaste.`
        : `La periodización ${PERIODIZACIONES[periodo].etiqueta.toLowerCase()} parte ${cs.length} ${cs.length === 1 ? "proceso" : "procesos"} (${cs.map((c) => c.suceso.nombre).join(", ")}): ${PERIODIZACIONES[periodo].explica}`
    );
  }
  const mal = bs.filter((b) => !b.bien);
  if (mal.length > 0) out.push(`${mal.length} ${mal.length === 1 ? "suceso está" : "sucesos están"} fuera de lugar: revisa su fecha en el cuaderno.`);
  return out.slice(0, 4);
}
