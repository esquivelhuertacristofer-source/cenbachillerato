/**
 * Modelo del SIMULADOR de políticas públicas (lab «politicas-publicas»).
 *
 * TODO es ficticio: el municipio «San Isidro del Valle», sus localidades y
 * TODAS las cifras son valores de simulación para aprender el ciclo; no son
 * estadísticas reales de ningún lugar de México.
 *
 * El modelo es DETERMINISTA y transparente (sin azar oculto): las mismas
 * decisiones dan siempre los mismos resultados, y cada número del informe se
 * puede rastrear a una carta que el alumno eligió.
 *
 *   abandono_final = abandono_inicial + Σ(efecto de cada política, con
 *                    rendimientos decrecientes y sinergia) × factor
 *   factor         = (meses activos / 12) × multiplicador de adopción × Π
 *                    multiplicadores de los imprevistos
 *   meses activos  = 12 − retraso de adopción − retrasos de imprevistos
 *   equidad, satisfacción = base + Σ aportes (políticas, adopción, imprevistos)
 *   reserva        = presupuesto − gasto en programas − costos de adopción/imprevistos
 */

/** Presupuesto del programa, en «millones simulados». */
export const PRESUPUESTO = 10;
/** Máximo de políticas que se pueden combinar. */
export const MAX_POLITICAS = 3;

/** Valores de partida del tablero municipal (simulación). */
export const INICIO = { abandono: 28, satisfaccion: 50, equidad: 40 } as const;

/* ── Etapa 1 · Identificar ─────────────────────────────────────────────── */

export type CausaId = "transporte" | "alerta" | "desgano" | "pantallas" | "docentes";

export interface Causa {
  id: CausaId;
  texto: string;
  /** ¿Es una causa de raíz respaldada por la evidencia? */
  raiz: boolean;
  /** Por qué sí / por qué no (se muestra tras decidir). */
  porque: string;
}

export const CAUSAS: Causa[] = [
  { id: "transporte", texto: "Llegar a la escuela cuesta tiempo y dinero (transporte y distancia)", raiz: true, porque: "La evidencia 1 y el mapa muestran que el abandono crece con la distancia y el costo del camión." },
  { id: "alerta", texto: "Nadie da seguimiento al estudiante que empieza a reprobar", raiz: true, porque: "La evidencia 3 muestra que la baja ocurre sin aviso, semanas después de las primeras materias reprobadas." },
  { id: "desgano", texto: "Los jóvenes ya no quieren estudiar", raiz: false, porque: "La gráfica de la evidencia 4 la contradice: la mayoría de quienes abandonaron dice que quería continuar. Es una opinión, no un dato." },
  { id: "pantallas", texto: "Faltan pantallas y tecnología en las aulas", raiz: false, porque: "La evidencia 6 muestra que casi todas las aulas ya tienen equipo; no explica por qué se van." },
  { id: "docentes", texto: "El profesorado no se esfuerza lo suficiente", raiz: false, porque: "Ninguna evidencia lo respalda; atribuir culpas sin datos desvía la política del problema real." },
];

export interface Evidencia {
  id: string;
  tipo: "testimonio" | "grafica" | "mapa" | "opinion";
  titulo: string;
  texto: string;
  /** Datos de la mini-gráfica (valores de simulación). */
  barras?: { etiqueta: string; valor: number; unidad: string }[];
  /** Puntos del mapa esquemático. */
  puntos?: { nombre: string; x: number; y: number; km: number; abandono: number }[];
}

export const EVIDENCIAS: Evidencia[] = [
  { id: "ev1", tipo: "testimonio", titulo: "Evidencia 1 · Testimonio", texto: "«Salí de la prepa en segundo semestre. Vivo en El Mezquite y el camión cuesta 60 pesos diarios; mi mamá ya no pudo pagarlo. Me gustaba estudiar.» — Joven de 16 años (testimonio ficticio)" },
  { id: "ev2", tipo: "mapa", titulo: "Evidencia 2 · Mapa del municipio", texto: "Entre más lejos de la cabecera, más abandono (valores de simulación).", puntos: [
    { nombre: "Cabecera", x: 50, y: 52, km: 0, abandono: 12 },
    { nombre: "La Noria", x: 22, y: 26, km: 9, abandono: 24 },
    { nombre: "El Mezquite", x: 80, y: 24, km: 18, abandono: 41 },
    { nombre: "Cerro Alto", x: 78, y: 82, km: 25, abandono: 47 },
  ] },
  { id: "ev3", tipo: "testimonio", titulo: "Evidencia 3 · Testimonio", texto: "«Reprobé dos materias en el primer parcial y nadie me avisó nada. Cuando fui a preguntar, ya estaba dada de baja.» — Joven de 17 años (testimonio ficticio)" },
  { id: "ev4", tipo: "grafica", titulo: "Evidencia 4 · Encuesta de salida", texto: "De cada 10 jóvenes que abandonaron, ¿qué dijeron? (simulación)", barras: [
    { etiqueta: "Quería continuar", valor: 8, unidad: "de 10" },
    { etiqueta: "No quería estudiar", valor: 2, unidad: "de 10" },
  ] },
  { id: "ev5", tipo: "opinion", titulo: "Evidencia 5 · Declaración", texto: "Un regidor dijo en la plaza: «Lo que pasa es que los muchachos de ahora ya no quieren estudiar». (Opinión sin datos; cuenta como ruido, no como evidencia.)" },
  { id: "ev6", tipo: "grafica", titulo: "Evidencia 6 · Inventario escolar", texto: "Aulas del municipio con proyector o pantalla (simulación).", barras: [
    { etiqueta: "Con equipo", valor: 9, unidad: "de 10" },
    { etiqueta: "Sin equipo", valor: 1, unidad: "de 10" },
  ] },
];

/* ── Etapa 2 · Diseñar ─────────────────────────────────────────────────── */

export interface Politica {
  id: string;
  nombre: string;
  icono: string;
  /** Costo en millones simulados. */
  costo: number;
  /** Causa a la que apunta (se revela solo si el alumno la marcó en el diagnóstico). */
  ataca: CausaId;
  /** Efecto REAL sobre la tasa de abandono, en puntos porcentuales (negativo = baja). */
  efecto: number;
  /** Aporte a la equidad. */
  equidad: number;
  /** Aporte a la satisfacción ciudadana (popularidad). */
  popularidad: number;
  /** Lo que promete quien la propone (estrellas 1-5): puede no coincidir con el efecto real. */
  promesa: number;
  descripcion: string;
}

export const POLITICAS: Politica[] = [
  { id: "beca-transporte", nombre: "Beca de transporte focalizada", icono: "fa-bus", costo: 4, ataca: "transporte", efecto: -7, equidad: 20, popularidad: 8, promesa: 4, descripcion: "Solo para quienes viven a más de 5 km, con prioridad a las localidades más lejanas." },
  { id: "alerta-tutorias", nombre: "Alerta temprana y tutorías", icono: "fa-bell", costo: 3, ataca: "alerta", efecto: -6, equidad: 10, popularidad: 4, promesa: 3, descripcion: "Cada plantel avisa a la familia tras 2 materias reprobadas y asigna un tutor." },
  { id: "pantallas", nombre: "Pantallas en todas las aulas", icono: "fa-tv", costo: 5, ataca: "pantallas", efecto: -0.5, equidad: -2, popularidad: 14, promesa: 5, descripcion: "Muy vistosa y aplaudida; sale en la foto de inauguración." },
  { id: "campana", nombre: "Campaña «Quédate en la prepa»", icono: "fa-bullhorn", costo: 2, ataca: "desgano", efecto: -0.5, equidad: 0, popularidad: 10, promesa: 4, descripcion: "Espectaculares y spots de radio para motivar a los jóvenes." },
  { id: "multas", nombre: "Multas a familias por inasistencia", icono: "fa-gavel", costo: 1, ataca: "desgano", efecto: 1.5, equidad: -15, popularidad: -6, promesa: 2, descripcion: "Barata de operar: se sanciona a quien falta mucho." },
  { id: "beca-universal", nombre: "Beca igual para todos, sin criterios", icono: "fa-hand-holding-dollar", costo: 4, ataca: "transporte", efecto: -3, equidad: -5, popularidad: 9, promesa: 4, descripcion: "El mismo monto para todo el alumnado, viva donde viva." },
];

/**
 * Rendimientos y sinergia: dos políticas que atacan la MISMA causa no suman
 * completo (la segunda aporta la mitad); beca focalizada + alerta temprana
 * se refuerzan (−1 pp extra).
 */
export function efectoBruto(ids: string[]): number {
  const vistas = new Set<CausaId>();
  let total = 0;
  for (const id of ids) {
    const p = POLITICAS.find((x) => x.id === id);
    if (!p) continue;
    total += vistas.has(p.ataca) ? p.efecto / 2 : p.efecto;
    vistas.add(p.ataca);
  }
  if (ids.includes("beca-transporte") && ids.includes("alerta-tutorias")) total -= 1;
  return total;
}

export function gastoDe(ids: string[]): number {
  return ids.reduce((s, id) => s + (POLITICAS.find((x) => x.id === id)?.costo ?? 0), 0);
}

/* ── Etapa 3 · Adoptar ─────────────────────────────────────────────────── */

export interface Adopcion {
  id: string;
  nombre: string;
  icono: string;
  /** Meses del año que se pierden antes de operar. */
  retraso: number;
  /** Costo en reserva. */
  costo: number;
  /** Multiplicador de eficacia (apropiación comunitaria). */
  mult: number;
  satisfaccion: number;
  equidad: number;
  descripcion: string;
}

export const ADOPCIONES: Adopcion[] = [
  { id: "consulta", nombre: "Consulta ciudadana", icono: "fa-people-group", retraso: 2, costo: 1, mult: 1.15, satisfaccion: 10, equidad: 5, descripcion: "Tarda 2 meses y gasta 1 de la reserva, pero la comunidad se apropia del programa." },
  { id: "cabildo", nombre: "Aprobación en cabildo", icono: "fa-landmark", retraso: 1, costo: 0, mult: 1.0, satisfaccion: 3, equidad: 0, descripcion: "El cabildo vota en 1 mes: legal y sin costo, con apoyo moderado." },
  { id: "decreto", nombre: "Decreto del presidente municipal", icono: "fa-file-signature", retraso: 0, costo: 0, mult: 0.8, satisfaccion: -8, equidad: -3, descripcion: "Arranca de inmediato, pero sin diálogo: poca legitimidad y más resistencia." },
];

/* ── Etapa 4 · Implementar ─────────────────────────────────────────────── */

export interface OpcionEvento {
  id: string;
  texto: string;
  /** Costo en reserva (la opción se bloquea si no alcanza). */
  costo: number;
  meses: number;
  mult: number;
  satisfaccion: number;
  equidad: number;
  resultado: string;
}

export interface Evento {
  id: string;
  titulo: string;
  icono: string;
  situacion: string;
  opciones: OpcionEvento[];
}

export const EVENTOS: Evento[] = [
  { id: "retraso", titulo: "Retraso de recursos", icono: "fa-hourglass-half", situacion: "La transferencia estatal llega 2 meses tarde y los planteles no pueden operar.", opciones: [
    { id: "esperar", texto: "Esperar a que lleguen", costo: 0, meses: 2, mult: 1, satisfaccion: -3, equidad: 0, resultado: "Pierdes 2 meses de operación." },
    { id: "adelanto", texto: "Adelantar con tu reserva (cuesta 1)", costo: 1, meses: 0.5, mult: 1, satisfaccion: 2, equidad: 0, resultado: "Pierdes solo medio mes, pero gastas reserva." },
    { id: "recortar", texto: "Recortar a la mitad la cobertura", costo: 0, meses: 0, mult: 0.8, satisfaccion: -4, equidad: -8, resultado: "No pierdes meses, pero atiendes a menos jóvenes y baja la equidad." },
  ] },
  { id: "participacion", titulo: "Baja participación", icono: "fa-user-minus", situacion: "Solo 4 de cada 10 jóvenes convocados se inscriben al programa.", opciones: [
    { id: "brigadas", texto: "Brigadas casa por casa (cuesta 1)", costo: 1, meses: 0, mult: 1.05, satisfaccion: 3, equidad: 6, resultado: "Llegas a quienes no se enteraron; sube la equidad." },
    { id: "dejar", texto: "Dejarlo como está", costo: 0, meses: 0, mult: 0.9, satisfaccion: 0, equidad: -5, resultado: "Se quedan fuera justo los que más lo necesitan." },
    { id: "condicionar", texto: "Exigir trámites extra para inscribirse", costo: 0, meses: 0, mult: 0.95, satisfaccion: -6, equidad: -6, resultado: "La burocracia aleja a los más vulnerables." },
  ] },
  { id: "sobreprecio", titulo: "Sobreprecio de un proveedor", icono: "fa-file-invoice-dollar", situacion: "Un proveedor cobra casi el doble por el servicio. Un vecino lo nota.", opciones: [
    { id: "contraloria", texto: "Activar la contraloría social vecinal", costo: 0, meses: 0.5, mult: 1, satisfaccion: 5, equidad: 2, resultado: "Un comité revisa facturas: tardas medio mes, pero ganas confianza." },
    { id: "ignorar", texto: "Ignorarlo para no frenar", costo: 1, meses: 0, mult: 0.95, satisfaccion: -6, equidad: 0, resultado: "Pierdes 1 de reserva y la confianza ciudadana." },
    { id: "directo", texto: "Cambiar de proveedor sin concurso", costo: 0, meses: 0, mult: 1, satisfaccion: -5, equidad: -2, resultado: "Rápido pero opaco: se sospecha de favoritismo." },
  ] },
  { id: "resistencia", titulo: "Grupo de interés en contra", icono: "fa-people-arrows", situacion: "Un grupo de transportistas se opone al cambio de rutas y amenaza con un paro.", opciones: [
    { id: "dialogar", texto: "Abrir una mesa de diálogo", costo: 0, meses: 1, mult: 1, satisfaccion: 4, equidad: 0, resultado: "Pierdes 1 mes, pero se llega a un acuerdo." },
    { id: "imponer", texto: "Imponer las rutas", costo: 0, meses: 0, mult: 0.92, satisfaccion: -10, equidad: 0, resultado: "El paro parcial reduce la eficacia y el apoyo." },
    { id: "ceder", texto: "Ceder y quitar parte del programa", costo: 0, meses: 0, mult: 0.8, satisfaccion: -2, equidad: -5, resultado: "Evitas el conflicto a costa de la eficacia." },
  ] },
  { id: "lluvias", titulo: "Lluvias bloquean caminos", icono: "fa-cloud-showers-heavy", situacion: "Las lluvias cortan el camino a dos localidades durante semanas.", opciones: [
    { id: "alterno", texto: "Contratar transporte alterno (cuesta 1)", costo: 1, meses: 0, mult: 1, satisfaccion: 3, equidad: 4, resultado: "Nadie se queda sin atención; gastas reserva." },
    { id: "esperar", texto: "Esperar a que baje el agua", costo: 0, meses: 1.5, mult: 1, satisfaccion: -4, equidad: -4, resultado: "Pierdes mes y medio justo donde más hace falta." },
    { id: "virtual", texto: "Tutorías por radio y mensajes", costo: 0, meses: 0, mult: 0.95, satisfaccion: 0, equidad: -2, resultado: "Mantienes contacto, aunque con menor alcance." },
  ] },
];

/** Resumen texto-semilla estable (djb2) a partir de las decisiones de diseño y adopción. */
function semilla(texto: string): number {
  let h = 5381;
  for (let i = 0; i < texto.length; i++) h = ((h << 5) + h + texto.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Escoge 3 de los 5 imprevistos con una semilla DETERMINISTA derivada de las
 * decisiones del alumno: parece azar pero es repetible (mismas decisiones →
 * mismos imprevistos). Es un barajado Fisher-Yates con un LCG.
 */
export function eventosDe(politicas: string[], adopcion: string): Evento[] {
  let s = semilla([...politicas].sort().join("|") + "#" + adopcion) || 1;
  const rnd = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const pool = [...EVENTOS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, 3);
}

/* ── Simulación ────────────────────────────────────────────────────────── */

export interface Decisiones {
  politicas: string[];
  adopcion: string;
  /** eventoId → opcionId */
  reacciones: Record<string, string>;
  /** Imprevistos fijos (para comparar diseños con LOS MISMOS imprevistos). */
  eventos?: string[];
}

export interface Resultado {
  abandono: number;
  satisfaccion: number;
  equidad: number;
  reserva: number;
  meses: number;
  factor: number;
  /** Cuánto bajó el abandono respecto al inicio (puntos, positivo = mejora). */
  mejora: number;
  /** Productos (outputs) que se pueden contar, no prueban impacto. */
  becas: number;
  tutorias: number;
}

const acota = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const r1 = (v: number) => Math.round(v * 10) / 10;

export function simular(d: Decisiones): Resultado {
  const ad = ADOPCIONES.find((a) => a.id === d.adopcion);
  const evs = d.eventos
    ? d.eventos.map((id) => EVENTOS.find((e) => e.id === id)).filter((e): e is Evento => !!e)
    : eventosDe(d.politicas, d.adopcion);
  let reserva = PRESUPUESTO - gastoDe(d.politicas) - (ad?.costo ?? 0);
  let meses = 12 - (ad?.retraso ?? 0);
  let mult = ad?.mult ?? 1;
  let sat: number = INICIO.satisfaccion + (ad?.satisfaccion ?? 0);
  let eq: number = INICIO.equidad + (ad?.equidad ?? 0);
  for (const ev of evs) {
    const op = ev.opciones.find((o) => o.id === d.reacciones[ev.id]);
    if (!op) continue;
    reserva -= op.costo;
    meses -= op.meses;
    mult *= op.mult;
    sat += op.satisfaccion;
    eq += op.equidad;
  }
  for (const id of d.politicas) {
    const p = POLITICAS.find((x) => x.id === id);
    if (!p) continue;
    sat += p.popularidad;
    eq += p.equidad;
  }
  meses = acota(meses, 3, 12);
  const factor = (meses / 12) * mult;
  const bruto = efectoBruto(d.politicas);
  // Un efecto que EMPEORA (multas) se aplica completo: no se «diluye» con el tiempo.
  const delta = bruto < 0 ? bruto * factor : bruto;
  const abandono = r1(acota(INICIO.abandono + delta, 5, 45));
  return {
    abandono,
    satisfaccion: Math.round(acota(sat, 0, 100)),
    equidad: Math.round(acota(eq, 0, 100)),
    reserva: Math.max(0, r1(reserva)),
    meses: r1(meses),
    factor: r1(factor * 100) / 100,
    mejora: r1(INICIO.abandono - abandono),
    becas: d.politicas.some((i) => i.startsWith("beca")) ? Math.round(180 * factor + 40) : 0,
    tutorias: d.politicas.includes("alerta-tutorias") ? Math.round(120 * factor) : 0,
  };
}

/** Los dos diseños alternativos del informe (se mantienen adopción e imprevistos). */
export const ALTERNATIVAS: { id: string; titulo: string; politicas: string[] }[] = [
  { id: "raiz", titulo: "Atacar las dos causas de raíz", politicas: ["beca-transporte", "alerta-tutorias"] },
  { id: "popular", titulo: "Gastar en lo más popular", politicas: ["pantallas", "beca-universal"] },
];

/** ¿Se cumple la meta del municipio? Bajar al menos 8 pp sin sacrificar equidad. */
export function metaLograda(r: Resultado): boolean {
  return r.mejora >= 8 && r.equidad >= 55;
}

/** Las 4 lecturas entre las que el alumno elige cuál prueba el impacto (etapa 5). */
export const INDICADORES_EVAL: { id: string; titulo: string; tipo: "insumo" | "producto" | "percepcion" | "impacto"; explica: string }[] = [
  { id: "gasto", titulo: "Presupuesto ejercido", tipo: "insumo", explica: "Es un INSUMO: dice cuánto se gastó, no si el problema bajó." },
  { id: "producto", titulo: "Becas y tutorías entregadas", tipo: "producto", explica: "Es un PRODUCTO (output): cuenta lo que se hizo; se pueden entregar mil becas sin que baje el abandono." },
  { id: "satisfaccion", titulo: "Satisfacción ciudadana", tipo: "percepcion", explica: "Es una PERCEPCIÓN: una medida popular puede gustar mucho y no resolver nada." },
  { id: "abandono", titulo: "Cambio en la tasa de abandono frente a antes", tipo: "impacto", explica: "Es el RESULTADO que importa: mide si cambió el problema que se quería atender (el impacto exige además compararlo con un grupo sin programa)." },
];
