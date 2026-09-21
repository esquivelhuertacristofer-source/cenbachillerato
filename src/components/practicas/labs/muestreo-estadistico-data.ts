/**
 * Datos del laboratorio "Muestreo: cómo elegir una muestra representativa"
 * (PM-VI-P07, progresión 7 de Pensamiento Matemático VI).
 *
 * El laboratorio se ancla al ejercicio A2 «calcular tamaño de muestra y
 * diseñar un muestreo estratificado», que viaja verbatim como reto evaluable;
 * el marco teórico es la lectura A1, los hechos salen del quiz A4 y el
 * glosario del A5.
 *
 * La escuela es la del ejercicio A2: 800 estudiantes en cuatro grados (250,
 * 210, 190 y 150). Lo que se mide —quién usa redes sociales más de 3 horas al
 * día— y la organización en salones son datos ilustrativos del laboratorio,
 * fijados con semilla para que la proporción real sea siempre la misma.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

/* ── Modos ────────────────────────────────────────────────────────────── */
export type Modo = "tecnicas" | "sesgo" | "error";

export const MODOS: Modo[] = ["tecnicas", "sesgo", "error"];

export interface ModoDef {
  etq: string;
  subtitulo: string;
  icono: string;
  color: string;
  fuente: "A1" | "A2";
}

export const MODOS_DEF: Record<Modo, ModoDef> = {
  tecnicas: {
    etq: "Técnicas probabilísticas",
    subtitulo: "Aleatorio simple, sistemático, estratificado y conglomerados",
    icono: "fa-people-group",
    color: "#34d399",
    fuente: "A2",
  },
  sesgo: {
    etq: "Sesgo de selección",
    subtitulo: "Encuestas voluntarias y de conveniencia",
    icono: "fa-filter-circle-xmark",
    color: "#f87171",
    fuente: "A1",
  },
  error: {
    etq: "Error muestral",
    subtitulo: "Cientos de muestras: el tamaño reduce el error, no el sesgo",
    icono: "fa-chart-column",
    color: "#a78bfa",
    fuente: "A1",
  },
};

/* ── Generador con semilla ───────────────────────────────────────────── */
export function mulberry32(semilla: number) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ══════════════════════════════════════════════════════════════════════
 * LA ESCUELA DEL EJERCICIO A2
 * ══════════════════════════════════════════════════════════════════════ */

export interface GradoDef {
  nombre: string;
  corto: string;
  /** Estudiantes del grado: verbatim del ejercicio A2. */
  tamano: number;
  /** Tamaño de cada salón (ilustrativo). */
  porSalon: number;
  /** Cuántos usan redes más de 3 h al día (ilustrativo). */
  usanMucho: number;
  color: string;
}

export const GRADOS: GradoDef[] = [
  { nombre: "1.er grado", corto: "1.º", tamano: 250, porSalon: 25, usanMucho: 40, color: "#60a5fa" },
  { nombre: "2.º grado", corto: "2.º", tamano: 210, porSalon: 30, usanMucho: 70, color: "#34d399" },
  { nombre: "3.er grado", corto: "3.º", tamano: 190, porSalon: 38, usanMucho: 118, color: "#a78bfa" },
  { nombre: "4.º grado", corto: "4.º", tamano: 150, porSalon: 30, usanMucho: 130, color: "#f472b6" },
];

export const N_POBLACION = GRADOS.reduce((s, g) => s + g.tamano, 0);
export const USAN_MUCHO = GRADOS.reduce((s, g) => s + g.usanMucho, 0);
/** La proporción real de la escuela: el parámetro que las muestras intentan estimar. */
export const P_REAL = USAN_MUCHO / N_POBLACION;

export interface Estudiante {
  i: number;
  grado: number;
  salon: number;
  /** Índice del asiento dentro de su salón. */
  asiento: number;
  usaMucho: boolean;
}

export interface Salon {
  id: number;
  grado: number;
  inicio: number;
  tamano: number;
}

function construirEscuela(): { estudiantes: Estudiante[]; salones: Salon[] } {
  const rnd = mulberry32(707);
  const estudiantes: Estudiante[] = [];
  const salones: Salon[] = [];
  GRADOS.forEach((g, gi) => {
    // Quiénes usan mucho las redes dentro del grado: exactamente g.usanMucho.
    const marcas = Array.from({ length: g.tamano }, (_, k) => k < g.usanMucho);
    for (let k = marcas.length - 1; k > 0; k--) {
      const j = Math.floor(rnd() * (k + 1));
      const t = marcas[k]!;
      marcas[k] = marcas[j]!;
      marcas[j] = t;
    }
    const nSalones = Math.round(g.tamano / g.porSalon);
    for (let s = 0; s < nSalones; s++) {
      const inicio = estudiantes.length;
      const tam = s === nSalones - 1 ? g.tamano - g.porSalon * (nSalones - 1) : g.porSalon;
      salones.push({ id: salones.length, grado: gi, inicio, tamano: tam });
      for (let a = 0; a < tam; a++) {
        const i = estudiantes.length;
        const local = i - estudiantes.filter((e) => e.grado < gi).length;
        estudiantes.push({ i, grado: gi, salon: salones.length - 1, asiento: a, usaMucho: marcas[local]! });
      }
    }
  });
  return { estudiantes, salones };
}

const ESCUELA = construirEscuela();
export const ESTUDIANTES: Estudiante[] = ESCUELA.estudiantes;
export const SALONES: Salon[] = ESCUELA.salones;

/* ══════════════════════════════════════════════════════════════════════
 * TÉCNICAS DE MUESTREO
 * ══════════════════════════════════════════════════════════════════════ */

export type Metodo = "simple" | "sistematico" | "estratificado" | "conglomerados" | "voluntaria" | "conveniencia";

export interface MetodoDef {
  etq: string;
  icono: string;
  probabilistico: boolean;
  descripcion: string;
}

export const METODOS: Record<Metodo, MetodoDef> = {
  simple: {
    etq: "Aleatorio simple",
    icono: "fa-shuffle",
    probabilistico: true,
    descripcion: "Todos tienen la misma probabilidad: como sacar boletos de una urna con los 800 nombres.",
  },
  sistematico: {
    etq: "Sistemático",
    icono: "fa-list-ol",
    probabilistico: true,
    descripcion: "De la lista ordenada se elige un inicio al azar entre los primeros k y luego cada k-ésimo: k = N/n.",
  },
  estratificado: {
    etq: "Estratificado",
    icono: "fa-layer-group",
    probabilistico: true,
    descripcion: "Cada grado es un estrato: se toma de cada uno una muestra aleatoria proporcional a su tamaño.",
  },
  conglomerados: {
    etq: "Por conglomerados",
    icono: "fa-object-group",
    probabilistico: true,
    descripcion: "Se sortean salones completos y se encuesta a todos sus integrantes.",
  },
  voluntaria: {
    etq: "Encuesta voluntaria en redes",
    icono: "fa-hashtag",
    probabilistico: false,
    descripcion: "Se publica el enlace y responde quien quiere. Quienes pasan más horas en redes lo ven y contestan mucho más.",
  },
  conveniencia: {
    etq: "Conveniencia: junto a la entrada",
    icono: "fa-door-open",
    probabilistico: false,
    descripcion: "Se encuesta a quien es fácil de alcanzar: quienes pasan por la entrada, junto a los salones de 4.º y 3.º.",
  },
};

export const METODOS_PROB: Metodo[] = ["simple", "sistematico", "estratificado", "conglomerados"];
export const METODOS_SESGO: Metodo[] = ["voluntaria", "conveniencia"];
export const TODOS_METODOS: Metodo[] = [...METODOS_PROB, ...METODOS_SESGO];

/** Probabilidad de responder la encuesta voluntaria (ilustrativa). */
export const RESPONDE_SI_USA_MUCHO = 0.5;
export const RESPONDE_SI_NO = 0.1;

/** Reparto proporcional con redondeo por mayor residuo: la suma da exactamente n. */
export function repartoProporcional(n: number, tamanos: number[] = GRADOS.map((g) => g.tamano)): number[] {
  const N = tamanos.reduce((a, b) => a + b, 0);
  const exactos = tamanos.map((t) => (t * n) / N);
  const base = exactos.map(Math.floor);
  let resto = n - base.reduce((a, b) => a + b, 0);
  const orden = exactos.map((x, i) => ({ i, r: x - Math.floor(x) })).sort((a, b) => b.r - a.r);
  for (const { i } of orden) {
    if (resto <= 0) break;
    base[i]! += 1;
    resto -= 1;
  }
  return base;
}

function tomarAlAzar(indices: number[], n: number, rnd: () => number): number[] {
  const copia = indices.slice();
  const m = Math.min(n, copia.length);
  for (let k = 0; k < m; k++) {
    const j = k + Math.floor(rnd() * (copia.length - k));
    const t = copia[k]!;
    copia[k] = copia[j]!;
    copia[j] = t;
  }
  return copia.slice(0, m);
}

/** Distancia de cada salón a la entrada: el orden en que los alcanza la encuesta de conveniencia. */
export const SALONES_POR_CERCANIA: number[] = SALONES.map((s) => s.id).sort((a, b) => {
  // La entrada está junto a 4.º; dentro del grado, los salones más altos quedan más cerca.
  const sa = SALONES[a]!;
  const sb = SALONES[b]!;
  return sb.grado - sa.grado || sb.id - sa.id;
});

export interface Muestra {
  metodo: Metodo;
  indices: number[];
  /** Solo en el sistemático. */
  k?: number;
  inicio?: number;
  /** Solo en el estratificado: cuántos de cada grado. */
  reparto?: number[];
  /** Solo en conglomerados: los salones sorteados. */
  salones?: number[];
  /** Solo en la voluntaria: cuántos respondieron en total. */
  respondieron?: number;
}

export function tomarMuestra(metodo: Metodo, n: number, rnd: () => number = Math.random): Muestra {
  const todos = ESTUDIANTES.map((e) => e.i);
  switch (metodo) {
    case "simple":
      return { metodo, indices: tomarAlAzar(todos, n, rnd) };
    case "sistematico": {
      // k = N/n puede no ser entero: se avanza k exacto y se redondea hacia
      // abajo, así la muestra recorre la lista completa.
      const k = N_POBLACION / n;
      const inicio = rnd() * k;
      const indices = Array.from({ length: n }, (_, j) => Math.floor(inicio + j * k)).filter((i) => i < N_POBLACION);
      return { metodo, indices, k, inicio: Math.floor(inicio) };
    }
    case "estratificado": {
      const reparto = repartoProporcional(n);
      const indices = GRADOS.flatMap((_, gi) =>
        tomarAlAzar(
          ESTUDIANTES.filter((e) => e.grado === gi).map((e) => e.i),
          reparto[gi]!,
          rnd,
        ),
      );
      return { metodo, indices, reparto };
    }
    case "conglomerados": {
      const orden = tomarAlAzar(
        SALONES.map((s) => s.id),
        SALONES.length,
        rnd,
      );
      const elegidos: number[] = [];
      let cuenta = 0;
      for (const id of orden) {
        if (cuenta >= n) break;
        elegidos.push(id);
        cuenta += SALONES[id]!.tamano;
      }
      const indices = elegidos.flatMap((id) => {
        const s = SALONES[id]!;
        return Array.from({ length: s.tamano }, (_, a) => s.inicio + a);
      });
      return { metodo, indices, salones: elegidos };
    }
    case "voluntaria": {
      const respondieron = ESTUDIANTES.filter((e) => rnd() < (e.usaMucho ? RESPONDE_SI_USA_MUCHO : RESPONDE_SI_NO)).map((e) => e.i);
      return { metodo, indices: tomarAlAzar(respondieron, n, rnd), respondieron: respondieron.length };
    }
    case "conveniencia": {
      // Quien pasa por la entrada: se sortea entre los más cercanos a ella.
      const cercanos: number[] = [];
      const cupo = Math.min(N_POBLACION, Math.ceil(n * 1.6));
      for (const id of SALONES_POR_CERCANIA) {
        const s = SALONES[id]!;
        for (let a = 0; a < s.tamano && cercanos.length < cupo; a++) cercanos.push(s.inicio + a);
        if (cercanos.length >= cupo) break;
      }
      return { metodo, indices: tomarAlAzar(cercanos, n, rnd) };
    }
  }
}

export function proporcionMuestra(indices: number[]): number {
  if (indices.length === 0) return 0;
  return indices.filter((i) => ESTUDIANTES[i]!.usaMucho).length / indices.length;
}

/** Margen de error al 95 % para una proporción, con corrección por población finita. */
export function margenError(p: number, n: number, N = N_POBLACION): number {
  if (n <= 0) return 0;
  const fpc = n >= N ? 0 : Math.sqrt((N - n) / (N - 1));
  return 1.96 * Math.sqrt((p * (1 - p)) / n) * fpc;
}

export const TAMANOS_ERROR = [20, 80, 320];
export const TAMANOS_MUESTRA = [40, 80, 120, 160, 200];
export const REPETICIONES = 300;

export interface ResumenRepeticiones {
  n: number;
  media: number;
  /** Mitad del intervalo que contiene al 95 % central de las estimaciones. */
  medio95: number;
  sesgo: number;
  /** Fracción de estimaciones a no más de 5 puntos del valor real. */
  dentro5: number;
}

export function resumir(estimaciones: number[]): ResumenRepeticiones {
  const n = estimaciones.length;
  if (n === 0) return { n, media: 0, medio95: 0, sesgo: 0, dentro5: 0 };
  const media = estimaciones.reduce((a, b) => a + b, 0) / n;
  const orden = estimaciones.slice().sort((a, b) => a - b);
  const q = (f: number) => orden[Math.min(n - 1, Math.max(0, Math.round(f * (n - 1))))]!;
  return {
    n,
    media,
    medio95: (q(0.975) - q(0.025)) / 2,
    sesgo: media - P_REAL,
    dentro5: estimaciones.filter((e) => Math.abs(e - P_REAL) <= 0.05).length / n,
  };
}

/* ── Tarjeta de estrellas: ¿qué técnica es? ───────────────────────────── */

export interface Situacion {
  texto: string;
  metodo: Metodo;
  porque: string;
}

export const SITUACIONES: Situacion[] = [
  { texto: "Se numera a los 500 alumnos y una computadora elige 50 números al azar.", metodo: "simple", porque: "Cada alumno tiene la misma probabilidad y se eligen uno por uno al azar." },
  { texto: "De una lista de 400 estudiantes se elige al azar el 7 y luego el 17, 27, 37…", metodo: "sistematico", porque: "Inicio aleatorio entre los primeros k = 10 y después cada décimo de la lista." },
  { texto: "Se encuesta a 30 de 1.º, 20 de 2.º y 10 de 3.º, en proporción a cuántos hay en cada grado.", metodo: "estratificado", porque: "La población se dividió en grados (estratos) y se tomó de cada uno en proporción a su tamaño." },
  { texto: "Se sortean 10 manzanas de la ciudad y se encuestan todos los hogares de esas manzanas.", metodo: "conglomerados", porque: "Se eligen grupos naturales completos y se estudian todos sus elementos." },
  { texto: "Un influencer pide a sus seguidores que contesten una encuesta sobre el uso del celular.", metodo: "voluntaria", porque: "Solo responden quienes lo siguen y tienen interés: la muestra se autoselecciona." },
  { texto: "Para saber qué opina la escuela, se pregunta a los primeros 40 que salen de la cafetería.", metodo: "conveniencia", porque: "Se eligió a quien era fácil de alcanzar, no a una muestra al azar de toda la escuela." },
  { texto: "El INEGI sortea viviendas dentro de cada entidad y tipo de localidad, urbana o rural.", metodo: "estratificado", porque: "Entidades y tipo de localidad son estratos: se garantiza que todos queden representados." },
  { texto: "Se sortean 5 escuelas del municipio y se aplica el cuestionario a todos sus alumnos.", metodo: "conglomerados", porque: "Las escuelas son conglomerados: se eligen completas y se encuesta a todos." },
  { texto: "En una fila de 600 personas, se elige al azar a una de las primeras 20 y luego a una de cada 20.", metodo: "sistematico", porque: "k = 600/30 = 20: inicio aleatorio y después cada vigésimo." },
  { texto: "Se ponen en una tómbola los nombres de los 300 trabajadores y se sacan 25.", metodo: "simple", porque: "Una tómbola da a todos la misma probabilidad de salir." },
];

/* ══════════════════════════════════════════════════════════════════════
 * Textos — VERBATIM de las actividades ancla
 * ══════════════════════════════════════════════════════════════════════ */

export const PROBLEMA =
  "En muchas situaciones practicas es imposible o demasiado costoso estudiar a toda la poblacion. El muestreo estadistico es la tecnica que permite obtener informacion valida sobre una poblacion a partir de una muestra representativa.";

export const DEFINICION =
  "El error muestral disminuye al aumentar el tamaño de la muestra y al mejorar el metodo de seleccion; el sesgo de seleccion no se corrige encuestando a más personas.";

/** Lectura A1 — los cinco párrafos, verbatim (la fila de la plataforma viene sin tildes). */
export const LECTURA_A1: string[] = [
  "En muchas situaciones practicas es imposible o demasiado costoso estudiar a toda la poblacion. El Censo de Poblacion del INEGI, que intenta contar a todos los mexicanos, se realiza solo cada diez años por el enorme costo que representa. En cambio, la Encuesta Nacional de Ingresos y Gastos de los Hogares (ENIGH) levanta datos de decenas de miles de hogares para estimar condiciones de vida de millones. El muestreo estadistico es la tecnica que permite obtener informacion valida sobre una poblacion a partir de una muestra representativa.",
  "El error muestral es la diferencia entre el resultado obtenido en la muestra y el verdadero valor poblacional (que generalmente no conocemos). El error muestral es inevitable, pero se puede controlar: disminuye al aumentar el tamaño de la muestra y al mejorar el metodo de seleccion. El margen de error que reportan las encuestas electorales ('con un margen de error de +/- 3 puntos porcentuales') refleja precisamente este error muestral controlado.",
  "Existen varios tipos de muestreo probabilistico (donde cada elemento de la poblacion tiene una probabilidad conocida y mayor a cero de ser seleccionado). El muestreo aleatorio simple selecciona los elementos al azar, como extraer boletos de una urna. Hoy se usan tablas de numeros aleatorios o funciones de computadora. El muestreo sistematico selecciona cada k-esimo elemento de una lista ordenada: k = N/n, donde N es el tamaño de la poblacion y n es el tamaño de la muestra deseada. Si N=800 y n=80, k=10: se selecciona un elemento de partida al azar entre el 1 y el 10, y luego cada decimo elemento. El muestreo estratificado divide la poblacion en grupos homogeneos llamados estratos (por edad, genero, region, nivel educativo) y selecciona una muestra proporcionalmente de cada estrato. Garantiza que todos los grupos importantes esten representados en la muestra. El muestreo por conglomerados selecciona grupos naturales completos (manzanas de una ciudad, escuelas de un municipio) y encuesta a todos sus miembros; es mas economico cuando la poblacion esta geograficamente dispersa.",
  "Los muestreos no probabilisticos (como el de conveniencia, donde se encuesta a quien sea accesible) tienen sesgo de seleccion y sus resultados no pueden generalizarse a la poblacion. Las encuestas en linea con autoselecion, donde solo responden quienes estan interesados o tienen acceso a internet, son ejemplos de muestras sesgadas que no son representativas de la poblacion general mexicana.",
  "El INEGI usa disenos muestrales complejos en sus encuestas: la ENIGH usa muestreo estratificado y por conglomerados en multiple etapas para garantizar representatividad nacional, estatal y rural/urbana. La Encuesta Nacional de Ocupacion y Empleo (ENOE) se levanta trimestralmente con metodologia similar. Entender como se construyen estas muestras es fundamental para interpretar correctamente los resultados y sus margenes de error.",
];

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS: string[] = [
  "¿Qué es el error muestral y cómo se puede controlar al diseñar una encuesta?",
  "¿Cuáles son las ventajas del muestreo estratificado sobre el muestreo aleatorio simple?",
  "¿Qué es el sesgo de selección y cómo puede afectar los resultados de una encuesta?",
  "¿Por qué el INEGI usa diseños muestrales complejos (estratificado + conglomerados + múltiple etapa) para la ENIGH en lugar de un simple muestreo aleatorio?",
];

export const INSTRUCCIONES: string[] = [
  "En «Técnicas probabilísticas», elige una técnica y toma una muestra de la escuela del ejercicio A2. Los elegidos se levantan: amarillos si usan redes más de 3 horas al día, blancos si no.",
  "Con el estratificado y n = 80, revisa la tabla: 25, 21, 19 y 15 estudiantes, uno de cada diez en cada grado.",
  "Toma varias muestras con la misma técnica y compara la estimación con la proporción real de la escuela.",
  "En «Sesgo de selección», prueba la encuesta voluntaria y la de conveniencia. Observa qué grados y qué estudiantes quedan dentro.",
  "En «Error muestral», repite 300 muestras con n = 20, 80 y 320. Mira cómo se angosta el histograma alrededor del valor real.",
  "Cambia a una técnica sesgada y vuelve a subir n: el histograma se angosta, pero lejos del valor real.",
  "Resuelve la tarjeta de estrellas identificando la técnica de cada situación.",
  "Cierra con el reto evaluable: el reparto del estratificado del ejercicio A2.",
];

export const IDEAS: string[] = [
  "Una muestra sirve si representa a la población: la técnica importa tanto como el tamaño.",
  "El estratificado asegura que cada grupo aparezca en su proporción; por eso sus estimaciones varían menos que las del aleatorio simple cuando los grupos son distintos entre sí.",
  "Los conglomerados abaratan el trabajo de campo, pero si los grupos se parecen por dentro, las estimaciones varían más.",
  "El margen de error mide el error muestral: con n cuatro veces mayor, el margen se reduce aproximadamente a la mitad.",
  "El sesgo es un error sistemático: una encuesta voluntaria con miles de respuestas sigue fallando hacia el mismo lado.",
  "Antes de creer un porcentaje, pregunta cómo se eligió a quienes respondieron.",
];

/** Hechos del quiz verdadero/falso A4 — verbatim (el enunciado falso va con su corrección). */
export const HECHOS: string[] = [
  "En el muestreo aleatorio simple, cada individuo de la población tiene la misma probabilidad de ser seleccionado.",
  "El muestreo estratificado divide la población en grupos homogéneos (estratos) y selecciona muestras de cada estrato en proporción al tamaño del estrato en la población.",
  "El sesgo de selección ocurre cuando los elementos de la muestra no son representativos de la población, lo que puede invalidar las conclusiones del estudio.",
  "El muestreo sistemático puede introducir sesgos si existe un patrón periódico en la lista que coincida con el intervalo k. Es conveniente cuando la lista es aleatoria, pero no garantiza aleatoriedad perfecta en todos los casos.",
  "Una encuesta voluntaria en redes sociales es un ejemplo de muestreo por conveniencia y puede producir resultados sesgados porque solo responden quienes tienen interés en el tema.",
];

export interface DatoClave {
  valor: string;
  texto: string;
  icono: string;
}

export const DATOS: DatoClave[] = [
  { valor: "k = 800/80 = 10", texto: "Intervalo del muestreo sistemático del ejemplo de la lectura A1.", icono: "fa-list-ol" },
  { valor: "25 · 21 · 19 · 15", texto: "Reparto del estratificado del ejercicio A2: el 10 % de cada grado.", icono: "fa-layer-group" },
  { valor: "± 3 puntos", texto: "Margen de error típico que reportan las encuestas electorales.", icono: "fa-square-poll-vertical" },
  { valor: "Cada 10 años", texto: "Periodicidad del Censo de Población del INEGI, por su enorme costo.", icono: "fa-house-user" },
];

export const CONTEXTO =
  "El INEGI no encuesta a millones de hogares cada trimestre: la ENIGH y la ENOE combinan estratos y conglomerados en varias etapas para que decenas de miles de hogares representen a todo el país, a cada entidad y a las zonas rurales y urbanas. Así se miden el ingreso, el gasto y el empleo con márgenes de error conocidos.";

export const FUENTE = "Material CEN Bachillerato — PM-VI. Ref.: INEGI-ENIGH, ENOE. Metodologia de muestreo.";

/** Glosario A5 — los 6 términos verbatim. */
export interface GlosarioItem {
  termino: string;
  definicion: string;
  ejemplo: string;
}

export const GLOSARIO: GlosarioItem[] = [
  {
    termino: "Muestreo aleatorio simple",
    definicion: "Técnica en la que cada elemento de la población tiene la misma probabilidad de ser seleccionado. Se puede realizar mediante números aleatorios, tómbola o tabla de números aleatorios.",
    ejemplo: "De una lista de 500 alumnos, seleccionar 50 al azar asignando un número a cada alumno y usando un generador de números aleatorios.",
  },
  {
    termino: "Muestreo sistemático",
    definicion: "Se elige aleatoriamente uno de los primeros k elementos y luego se selecciona cada k-ésimo elemento: k = N/n (tamaño de la población entre tamaño de la muestra).",
    ejemplo: "De 400 estudiantes (N) se desea una muestra de 40 (n): k=400/40=10. Se elige al azar uno entre los primeros 10 (por ejemplo, el 7) y luego el 17, 27, 37, …",
  },
  {
    termino: "Muestreo estratificado",
    definicion: "La población se divide en subgrupos homogéneos (estratos: sexo, grado, región) y se selecciona una muestra aleatoria de cada estrato en proporción a su tamaño.",
    ejemplo: "Escuela con 300 alumnos de 1er grado, 200 de 2do y 100 de 3ro. Para una muestra de 60: 30 de 1er, 20 de 2do y 10 de 3er grado (en proporción).",
  },
  {
    termino: "Muestreo por conglomerados",
    definicion: "La población se divide en grupos heterogéneos (conglomerados), se seleccionan aleatoriamente algunos conglomerados y se estudian todos sus elementos.",
    ejemplo: "Para encuestar hogares de una ciudad: se seleccionan al azar 10 manzanas (conglomerados) y se encuestan todos los hogares de esas manzanas.",
  },
  {
    termino: "Sesgo y error muestral",
    definicion: "El sesgo es un error sistemático que hace que la muestra no represente bien a la población (pregunta tendenciosa, muestra no representativa). El error muestral es la diferencia aleatoria inevitable entre el estadístico de la muestra y el parámetro de la población.",
    ejemplo: "Pregunta sesgada: '¿No cree usted que el director debería renunciar?' induce una respuesta. El error muestral disminuye aumentando el tamaño de la muestra.",
  },
  {
    termino: "Diseño de encuesta: pasos esenciales",
    definicion: "1) Definir el objetivo y la población. 2) Elegir técnica de muestreo y calcular n. 3) Diseñar el cuestionario (preguntas claras, sin sesgo). 4) Recopilar datos. 5) Organizar y analizar. 6) Interpretar y reportar con medidas descriptivas.",
    ejemplo: "Estudio sobre hábitos de lectura en la escuela: definir población (alumnos de bachillerato), elegir muestreo estratificado por grado, diseñar 10 preguntas sin sesgo, encuestar, calcular media y frecuencias, presentar histograma y conclusiones.",
  },
];

/* ── Reto evaluable: el ejercicio A2, verbatim ────────────────────────── */

export const RETO_A2: RetoNumericoData = {
  titulo: "Calcular tamaño de muestra y diseñar un muestreo estratificado",
  contexto: "El ejercicio aplica el muestreo estratificado proporcional: la fracción de muestreo f = n/N se aplica igual a cada estrato.",
  problema:
    "Quieres encuestar a estudiantes de tu escuela sobre el uso de redes sociales. Tu escuela tiene 800 estudiantes distribuidos en 4 grados: 1o (250), 2o (210), 3o (190) y 4o (150). Decides usar muestreo estratificado con una muestra de n = 80 estudiantes. Calcula cuantos estudiantes debes encuestar de cada grado.",
  campos: [
    { etiqueta: "Grado 1", objetivo: 25, tolerancia: 0, unidad: "estudiantes" },
    { etiqueta: "Grado 2", objetivo: 21, tolerancia: 0, unidad: "estudiantes" },
    { etiqueta: "Grado 3", objetivo: 19, tolerancia: 0, unidad: "estudiantes" },
    { etiqueta: "Grado 4", objetivo: 15, tolerancia: 0, unidad: "estudiantes" },
    { etiqueta: "Total de la muestra", objetivo: 80, tolerancia: 0, unidad: "estudiantes" },
  ],
  pasosGuia: [
    "Calcula la fraccion de muestreo: f = n/N = 80/800 = 0.10 = 10%.",
    "Grado 1: 250 x 0.10 = 25 estudiantes.",
    "Grado 2: 210 x 0.10 = 21 estudiantes.",
    "Grado 3: 190 x 0.10 = 19 estudiantes.",
    "Grado 4: 150 x 0.10 = 15 estudiantes.",
    "Verificacion: 25 + 21 + 19 + 15 = 80 estudiantes. Correcto.",
  ],
  respuestaFinal: "25 + 21 + 19 + 15 = 80 estudiantes.",
};
