/**
 * Mesa de redacción de gráficas — lógica pura (sin React) de LabTiposGraficas.
 *
 * Escenario (SIMULACIÓN): el alumno es el editor gráfico de un diario FICTICIO.
 * Recibe seis conjuntos de datos inventados, elige el tipo de gráfica y la
 * gráfica se dibuja al instante; una lectora de prueba reacciona (entendió /
 * entendió a medias / se confundió) y se explica por qué ese tipo cuadra o
 * distorsiona los datos. El eje recortado (trampa de A1) se puede activar y se
 * mide cuánto exagera la diferencia.
 *
 * Todos los lugares, cooperativas y cifras son inventados («simulación»).
 */

export type Tipo = "barras" | "linea" | "circular" | "dispersion" | "histograma" | "area";
export type Naturaleza = "categorias" | "serie" | "partes" | "relacion" | "distribucion" | "acumulado";
export type Nivel = "claro" | "regular" | "confunde";

export const TIPOS: { id: Tipo; nombre: string; corto: string; icono: string }[] = [
  { id: "barras", nombre: "Barras", corto: "Barras", icono: "fa-chart-column" },
  { id: "linea", nombre: "Líneas", corto: "Líneas", icono: "fa-chart-line" },
  { id: "circular", nombre: "Circular (pastel)", corto: "Pastel", icono: "fa-chart-pie" },
  { id: "dispersion", nombre: "Dispersión", corto: "Dispersión", icono: "fa-braille" },
  { id: "histograma", nombre: "Histograma", corto: "Histograma", icono: "fa-chart-simple" },
  { id: "area", nombre: "Área", corto: "Área", icono: "fa-chart-area" },
];

export interface Punto {
  /** Etiqueta de la categoría (o del periodo). */
  e: string;
  x: number;
  y: number;
}

export interface Caso {
  id: string;
  titulo: string;
  naturaleza: Naturaleza;
  /** Lo que pide la editora. */
  encargo: string;
  unidad: string;
  ejeX: string;
  ejeY: string;
  puntos: Punto[];
  /** Imagen: /media/labs-sim/tipos-graficas/<imagen>.webp */
  imagen: string;
  icono: string;
}

const mes = (i: number) => `M${i + 1}`;
const permutar = <T,>(a: T[], paso: number): T[] => a.map((_, i) => a[(i * paso) % a.length]!);

const HORAS = [0.5, 1, 1, 1.5, 2, 2, 2.5, 3, 3, 3.5, 4, 4, 4.5, 5, 5, 5.5, 6, 6, 6.5, 7, 7, 7.5, 8, 8];
const RUIDO = [0.5, -0.4, 0.2, -0.6, 0.4, -0.2, 0.6, -0.5];
const EDADES = [15, 16, 16, 17, 17, 17, 18, 18, 19, 19, 20, 21, 34, 36, 37, 38, 38, 39, 40, 41, 41, 42, 43, 44, 44, 45, 46, 47, 48, 50, 52, 53, 55, 58, 61, 63, 66, 68, 70, 72];
const PRESA = [38, 41, 45, 52, 58, 66, 79, 88, 84, 70, 55, 44];
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export const CASOS: Caso[] = [
  {
    id: "c-hogares", titulo: "Internet en los hogares", naturaleza: "categorias",
    encargo: "La editora quiere comparar qué municipios tienen más hogares con internet.",
    unidad: "% de hogares", ejeX: "Municipio", ejeY: "% de hogares con internet",
    puntos: [
      ["Valle Alto", 82], ["Costa Verde", 74], ["Sierra Norte", 41], ["Río Claro", 68],
      ["Llano Seco", 55], ["Bahía Sur", 77], ["Monte Real", 36], ["Puerto Nuevo", 63],
    ].map(([e, y], i) => ({ e: e as string, x: i + 1, y: y as number })),
    imagen: "hogares-municipios", icono: "fa-house-signal",
  },
  {
    id: "c-ventas", titulo: "Ventas de la cooperativa", naturaleza: "serie",
    encargo: "La editora quiere mostrar cómo han cambiado las ventas de una cooperativa en 24 meses.",
    unidad: "miles de pesos", ejeX: "Mes", ejeY: "Ventas (miles de pesos)",
    puntos: Array.from({ length: 24 }, (_, i) => ({ e: mes(i), x: i + 1, y: Math.round(120 + 4 * i + 22 * Math.sin((i * Math.PI) / 6)) })),
    imagen: "cooperativa-ventas", icono: "fa-store",
  },
  {
    id: "c-dia", titulo: "El día de una estudiante", naturaleza: "partes",
    encargo: "La editora quiere mostrar cómo se reparten las 24 horas de una estudiante.",
    unidad: "horas", ejeX: "Actividad", ejeY: "Horas del día",
    puntos: [
      ["Dormir", 8], ["Escuela", 7], ["Traslados", 2], ["Tareas", 3], ["Tiempo libre", 4],
    ].map(([e, y], i) => ({ e: e as string, x: i + 1, y: y as number })),
    imagen: "dia-estudiante", icono: "fa-clock",
  },
  {
    id: "c-estudio", titulo: "Estudio y calificación", naturaleza: "relacion",
    encargo: "La editora quiere saber si estudiar más horas se relaciona con mejor calificación en 24 estudiantes.",
    unidad: "calificación", ejeX: "Horas de estudio a la semana", ejeY: "Calificación",
    puntos: permutar(
      HORAS.map((h, i) => ({ e: `Est. ${i + 1}`, x: h, y: Math.min(10, Math.round((5 + 0.5 * h + RUIDO[i % RUIDO.length]!) * 10) / 10) })),
      7
    ),
    imagen: "horas-estudio", icono: "fa-book-open-reader",
  },
  {
    id: "c-club", titulo: "Edades del club de lectura", naturaleza: "distribucion",
    encargo: "La editora quiere ver cómo se agrupan las edades de las 40 personas de un club de lectura.",
    unidad: "años", ejeX: "Persona", ejeY: "Edad (años)",
    puntos: permutar(EDADES, 13).map((y, i) => ({ e: `P${i + 1}`, x: i + 1, y })),
    imagen: "club-lectura", icono: "fa-users",
  },
  {
    id: "c-presa", titulo: "Agua en la presa", naturaleza: "acumulado",
    encargo: "La editora quiere enfatizar cuánta agua se acumula en una presa a lo largo del año.",
    unidad: "millones de m³", ejeX: "Mes", ejeY: "Agua almacenada (millones de m³)",
    puntos: PRESA.map((y, i) => ({ e: MESES[i]!, x: i + 1, y })),
    imagen: "presa-agua", icono: "fa-water",
  },
];

/* ── Qué tan bien le va a cada tipo con cada naturaleza de datos ─────── */

interface Veredicto {
  nivel: Nivel;
  porque: string;
  lector: string;
}

const V: Record<Naturaleza, Record<Tipo, Veredicto>> = {
  categorias: {
    barras: { nivel: "claro", porque: "Cada categoría tiene su barra y se comparan alturas con facilidad.", lector: "Vio de inmediato qué municipios van atrás." },
    linea: { nivel: "confunde", porque: "La línea une categorías sin orden: sugiere una tendencia que no existe.", lector: "Creyó que el acceso «sube y baja» de un municipio al siguiente." },
    circular: { nivel: "confunde", porque: "Los porcentajes no suman 100 %: no son partes de un todo, y 8 rebanadas son difíciles de comparar.", lector: "No supo qué representaba el círculo completo." },
    dispersion: { nivel: "confunde", porque: "No hay dos variables numéricas; los puntos solo marcan posiciones sin sentido.", lector: "Buscó una relación entre variables que no existe." },
    histograma: { nivel: "confunde", porque: "Un histograma cuenta cuántos valores caen en rangos; aquí se pierde qué municipio es cuál.", lector: "No pudo saber qué municipio tenía cada porcentaje." },
    area: { nivel: "confunde", porque: "El relleno sugiere algo que se acumula en el tiempo, y aquí no hay tiempo.", lector: "Pensó que los municipios eran etapas de un proceso." },
  },
  serie: {
    barras: { nivel: "regular", porque: "24 barras se leen, pero cuesta ver la forma de la tendencia.", lector: "Vio los valores, pero tardó en notar que sube." },
    linea: { nivel: "claro", porque: "La línea sigue el paso del tiempo y deja ver la tendencia y las subidas de temporada.", lector: "Notó enseguida que las ventas suben con altibajos." },
    circular: { nivel: "confunde", porque: "Los meses no son partes de un todo; 24 rebanadas no dicen nada del cambio.", lector: "No supo qué significaba cada rebanada." },
    dispersion: { nivel: "regular", porque: "Los puntos muestran el patrón, pero sin línea cuesta seguir el hilo del tiempo.", lector: "Vio una nube que sube, sin saber el orden de los meses." },
    histograma: { nivel: "confunde", porque: "El histograma agrupa valores en rangos y borra el orden de los meses.", lector: "No pudo saber en qué mes ocurrió cada venta." },
    area: { nivel: "regular", porque: "Funciona para la tendencia, pero el relleno sobra si lo importante no es el volumen acumulado.", lector: "Entendió la tendencia, aunque creyó que se sumaban las ventas." },
  },
  partes: {
    barras: { nivel: "regular", porque: "Compara bien las actividades, pero no muestra que juntas forman las 24 horas.", lector: "Comparó horas, pero no vio el día completo." },
    linea: { nivel: "confunde", porque: "Une actividades que no tienen orden y sugiere una evolución falsa.", lector: "Creyó que las horas «bajan» de una actividad a otra." },
    circular: { nivel: "claro", porque: "Son 5 partes de un todo (24 horas): el círculo muestra de un vistazo qué parte es cada una.", lector: "Entendió que dormir y la escuela ocupan más de la mitad del día." },
    dispersion: { nivel: "confunde", porque: "No hay dos variables numéricas que relacionar.", lector: "Buscó una relación que no existe." },
    histograma: { nivel: "confunde", porque: "Cuenta valores en rangos; aquí lo importante son las actividades, no los rangos.", lector: "No supo a qué actividad correspondía cada barra." },
    area: { nivel: "confunde", porque: "El área sugiere acumulación en el tiempo; las actividades no son tiempo.", lector: "Pensó que las actividades ocurrían una tras otra." },
  },
  relacion: {
    barras: { nivel: "confunde", porque: "Una barra por estudiante muestra calificaciones, pero oculta las horas de estudio.", lector: "Vio calificaciones sin saber cuánto estudió cada quien." },
    linea: { nivel: "confunde", porque: "La línea une estudiantes que no tienen orden y dibuja un zigzag que tapa la relación.", lector: "Creyó que las calificaciones suben y bajan al azar." },
    circular: { nivel: "confunde", porque: "Las calificaciones no son partes de un todo.", lector: "No supo qué significaba cada rebanada." },
    dispersion: { nivel: "claro", porque: "Cada punto cruza horas y calificación: se ve que, en general, más horas van con mejor nota (sin probar causa).", lector: "Notó que la nube de puntos sube hacia la derecha." },
    histograma: { nivel: "confunde", porque: "Solo cuenta calificaciones por rango; las horas de estudio desaparecen.", lector: "No pudo saber si estudiar más ayudaba." },
    area: { nivel: "confunde", porque: "El relleno sugiere un orden en el tiempo que aquí no existe.", lector: "Pensó que los estudiantes iban en una secuencia." },
  },
  distribucion: {
    barras: { nivel: "regular", porque: "40 barras se leen, pero no se ve cómo se agrupan las edades.", lector: "Vio edades sueltas sin notar los dos grupos." },
    linea: { nivel: "confunde", porque: "Une personas que no tienen orden y dibuja picos sin significado.", lector: "Creyó que la edad «sube y baja» entre personas." },
    circular: { nivel: "confunde", porque: "40 rebanadas diminutas: nadie puede leerlas.", lector: "Vio un círculo ilegible." },
    dispersion: { nivel: "regular", porque: "Se ve la nube de edades, pero no cuántas personas hay en cada rango.", lector: "Notó dos zonas, sin poder contar cuántas personas hay." },
    histograma: { nivel: "claro", porque: "Agrupa las edades en rangos y la altura cuenta personas: aparecen los dos grupos (jóvenes y adultos).", lector: "Entendió que hay un grupo joven y otro de adultos." },
    area: { nivel: "confunde", porque: "El área sugiere acumulación en el tiempo; las personas no están ordenadas.", lector: "Pensó que el club crecía con el tiempo." },
  },
  acumulado: {
    barras: { nivel: "regular", porque: "Muestra el nivel de cada mes, pero no da la sensación de volumen que se acumula.", lector: "Leyó los meses uno por uno." },
    linea: { nivel: "regular", porque: "Muestra la tendencia, aunque sin enfatizar el volumen de agua.", lector: "Vio que sube y baja, sin sentir cuánta agua hay." },
    circular: { nivel: "confunde", porque: "Los meses no son partes de un todo.", lector: "No entendió qué representaba cada rebanada." },
    dispersion: { nivel: "regular", porque: "Los puntos muestran el patrón, pero no el volumen ni la continuidad.", lector: "Vio puntos sueltos sin sentir el llenado." },
    histograma: { nivel: "confunde", porque: "Agrupa niveles en rangos y borra el orden de los meses.", lector: "No pudo saber cuándo estaba llena la presa." },
    area: { nivel: "claro", porque: "El área rellena enfatiza el volumen almacenado y sigue el paso de los meses.", lector: "Vio cómo la presa se llena y se vacía durante el año." },
  },
};

export const CLARIDAD: Record<Nivel, number> = { claro: 92, regular: 55, confunde: 15 };

/** Ratio visual con eje recortado: base = 90 % del mínimo (descartando el cero). */
export function baseEje(caso: Caso, tipo: Tipo, recortado: boolean): number {
  if (!recortado || !ejeAplica(tipo)) return 0;
  const min = Math.min(...caso.puntos.map((p) => p.y));
  return Math.floor(min * 0.9);
}

/** El eje recortado solo cambia las gráficas que miden con alturas. */
export function ejeAplica(tipo: Tipo): boolean {
  return tipo === "barras" || tipo === "linea" || tipo === "area";
}

export interface Evaluacion {
  nivel: Nivel;
  claridad: number;
  porque: string;
  lector: string;
  /** Cuántas veces mayor es la barra más alta que la más baja, en los datos. */
  razonReal: number;
  /** ...y cómo se VE con el eje elegido. */
  razonVisual: number;
  engano: boolean;
}

export function evaluar(caso: Caso, tipo: Tipo, recortado: boolean): Evaluacion {
  const v = V[caso.naturaleza][tipo];
  const ys = caso.puntos.map((p) => p.y);
  const max = Math.max(...ys);
  const min = Math.min(...ys);
  const base = baseEje(caso, tipo, recortado);
  const razonReal = max / min;
  const razonVisual = (max - base) / Math.max(0.0001, min - base);
  const engano = ejeAplica(tipo) && recortado && razonVisual >= razonReal * 1.5;
  if (engano) {
    return {
      nivel: "confunde",
      claridad: CLARIDAD.confunde,
      porque: `El eje no empieza en cero: la diferencia real es de ×${razonReal.toFixed(1)} pero se ve de ×${razonVisual.toFixed(1)}. ${v.nivel === "claro" ? "El tipo era el adecuado; el eje lo vuelve engañoso." : v.porque}`,
      lector: "Se llevó una impresión exagerada de la diferencia.",
      razonReal,
      razonVisual,
      engano: true,
    };
  }
  return { nivel: v.nivel, claridad: CLARIDAD[v.nivel], porque: v.porque, lector: v.lector, razonReal, razonVisual, engano: false };
}

/** El tipo ideal de cada caso (para feedback tras publicar un tipo flojo). */
export function tipoIdeal(caso: Caso): Tipo {
  return (Object.keys(V[caso.naturaleza]) as Tipo[]).find((t) => V[caso.naturaleza][t].nivel === "claro") ?? "barras";
}

/* ── Geometría ────────────────────────────────────────────────────────── */

export function maximoBonito(v: number): number {
  const pasos = [1, 2, 2.5, 5, 10];
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  for (const p of pasos) if (p * mag >= v) return p * mag;
  return 10 * mag;
}

export interface Bin {
  desde: number;
  hasta: number;
  cuenta: number;
}

export function histograma(valores: number[], n = 7): Bin[] {
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const ancho = (max - min) / n || 1;
  const bins: Bin[] = Array.from({ length: n }, (_, i) => ({ desde: min + i * ancho, hasta: min + (i + 1) * ancho, cuenta: 0 }));
  for (const v of valores) {
    const i = Math.min(n - 1, Math.floor((v - min) / ancho));
    bins[i]!.cuenta += 1;
  }
  return bins;
}

export interface Rebanada {
  e: string;
  ini: number;
  fin: number;
  pct: number;
}

/** Ángulos (radianes, desde las 12 en punto) de cada rebanada. */
export function rebanadas(puntos: Punto[]): Rebanada[] {
  const total = puntos.reduce((s, p) => s + p.y, 0);
  let acc = 0;
  return puntos.map((p) => {
    const ini = (acc / total) * Math.PI * 2;
    acc += p.y;
    return { e: p.e, ini, fin: (acc / total) * Math.PI * 2, pct: (p.y / total) * 100 };
  });
}

/** Rótulo corto del veredicto de la lectora. */
export function rotuloNivel(n: Nivel): string {
  return n === "claro" ? "Se entendió" : n === "regular" ? "Se entendió a medias" : "Confundió o engañó";
}
