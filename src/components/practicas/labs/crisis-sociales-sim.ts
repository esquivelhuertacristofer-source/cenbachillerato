/**
 * Modelo del SIMULADOR de crisis social (lab «crisis-sociales»).
 *
 * TODO es ficticio: el municipio «Cañada Verde», la colonia «El Mirador», la
 * fábrica y todas las cifras son valores de simulación para aprender a leer una
 * crisis; no describen ningún lugar ni hecho real. Los conceptos (causas
 * estructurales, actores sociales, escalas, violencia estructural) vienen del
 * propio laboratorio.
 *
 * Modelo determinista y transparente:
 *   alerta  = señales relevantes elegidas (de 3 visitas) / 3
 *   enfoque = las 2 causas elegidas son estructurales
 *   cada mes: indicador = indicador + efecto de la decisión + deriva
 *     · si la decisión ataca una causa de fondo Y hay enfoque, lo bueno rinde ×1.5
 *     · deriva por mes de crisis: empleo −3, confianza −4, conflictividad +5
 *   casos del mes = base del mes × (1 − 0.25·alerta) × Π(1 + efecto sobre casos)
 */

export type IndId = "empleo" | "confianza" | "conflictividad";
export type Indicadores = Record<IndId, number>;

export const INICIO: Indicadores = { empleo: 50, confianza: 55, conflictividad: 35 };
export const DERIVA: Indicadores = { empleo: -3, confianza: -4, conflictividad: 5 };
/** Casos por cada 10 000 personas, meses 1 a 4, SIN respuesta (simulación). */
export const CASOS_BASE = [12, 30, 62, 100];
export const VISITAS = 3;

export const IND_INFO: { id: IndId; nombre: string; icono: string; buenoAlto: boolean }[] = [
  { id: "empleo", nombre: "Empleo", icono: "fa-briefcase", buenoAlto: true },
  { id: "confianza", nombre: "Confianza en las instituciones", icono: "fa-handshake", buenoAlto: true },
  { id: "conflictividad", nombre: "Conflictividad", icono: "fa-fire", buenoAlto: false },
];

/* ── Fase 1 · Señales tempranas ───────────────────────────────────────── */

export interface Senal {
  id: string;
  foto: string;
  icono: string;
  texto: string;
  tipo: "relevante" | "opinion" | "detonante";
  porque: string;
}

export const SENALES: Senal[] = [
  { id: "informal", foto: "puestos-banqueta", icono: "fa-store", texto: "Cada semana hay más puestos ambulantes frente a la fábrica, y casi nadie tiene seguro médico.", tipo: "relevante", porque: "Es informalidad laboral: sin prestaciones ni seguro, un cierre o una enfermedad golpean directo. Es una causa estructural." },
  { id: "clinica", foto: "fila-clinica", icono: "fa-hospital", texto: "La clínica del seguro tiene filas desde la madrugada y el centro de salud estatal no tiene medicinas.", tipo: "relevante", porque: "Muestra un sistema de salud fragmentado y sin abasto: la vulnerabilidad existía antes de la crisis." },
  { id: "hacina", foto: "colonia-hacinada", icono: "fa-people-roof", texto: "En la colonia El Mirador viven siete personas por casa y comparten una sola llave de agua.", tipo: "relevante", porque: "El hacinamiento impide aislarse y obliga a almacenar agua: la crisis pega distinto según dónde vives." },
  { id: "influencer", foto: "celular-opinion", icono: "fa-mobile-screen", texto: "Un influencer local asegura que todo es una exageración y que «la gente se asusta por nada».", tipo: "opinion", porque: "Es una opinión sin datos: no es una señal. Confundir opinión con evidencia retrasa la respuesta." },
  { id: "lluvia", foto: "lluvia-charcos", icono: "fa-cloud-rain", texto: "Este año llovió más que el anterior y hay charcos por todas partes.", tipo: "detonante", porque: "Es un detonante natural: explica el brote, pero no por qué unos barrios sufren más. Las crisis nunca son solo naturales." },
  { id: "colectivo", foto: "despensas-vecinas", icono: "fa-hands-holding-circle", texto: "Un colectivo de vecinas reparte despensas y avisa de casos de fiebre antes que el centro de salud.", tipo: "relevante", porque: "La sociedad civil llena vacíos donde el Estado llega tarde: sus avisos son una alerta temprana útil." },
];

export function alertaDe(sel: string[]): number {
  const buenas = sel.filter((id) => SENALES.find((s) => s.id === id)?.tipo === "relevante").length;
  return Math.min(VISITAS, buenas) / VISITAS;
}

/* ── Fase 2 · Causas ──────────────────────────────────────────────────── */

export interface CausaOpcion {
  id: string;
  texto: string;
  estructural: boolean;
  porque: string;
}

export const CAUSAS: CausaOpcion[] = [
  { id: "informalidad", texto: "Informalidad laboral: sin seguro médico ni prestaciones de desempleo", estructural: true, porque: "Es una condición de fondo, previa y duradera: determina quién puede quedarse en casa sin perder el ingreso." },
  { id: "salud", texto: "Servicios de salud fragmentados y sin abasto parejo", estructural: true, porque: "Es una causa estructural: la atención depende de qué institución te toca, no de cuánto la necesitas." },
  { id: "indicaciones", texto: "La gente no sigue las indicaciones", estructural: false, porque: "Culpar a las personas ignora las condiciones que les impiden cumplirlas (violencia estructural): no es una causa de fondo." },
  { id: "clima", texto: "Mala suerte: llovió más este año", estructural: false, porque: "La lluvia es un detonante inmediato; una causa estructural opera «más allá de sus detonantes»." },
];

export function enfoqueOk(sel: string[]): boolean {
  return sel.length === 2 && sel.every((id) => CAUSAS.find((c) => c.id === id)?.estructural);
}

/* ── Fase 3 · Tres meses de decisiones ────────────────────────────────── */

export type ActorTipo = "Estado" | "Sociedad civil" | "Sector empresarial" | "Organismos internacionales";

export interface Opcion {
  id: string;
  texto: string;
  actor: ActorTipo;
  escala: "Local" | "Nacional" | "Global";
  icono: string;
  /** ¿Ataca una causa de fondo (informalidad o salud fragmentada)? */
  estructural: boolean;
  efecto: Partial<Indicadores> & { casos: number };
  porque: string;
}

export interface Evento {
  id: string;
  mes: number;
  titulo: string;
  texto: string;
  foto: string;
  icono: string;
  opciones: Opcion[];
}

export const EVENTOS: Evento[] = [
  {
    id: "brote", mes: 2, titulo: "Brote de dengue en El Mirador", icono: "fa-bacterium", foto: "",
    texto: "Los casos se duplican en la colonia. ¿Qué respuesta eliges?",
    opciones: [
      { id: "fumigar", texto: "Fumigar y cercar la colonia", actor: "Estado", escala: "Local", icono: "fa-spray-can", estructural: false, efecto: { casos: -12, confianza: 2, empleo: -1 }, porque: "Baja los casos hoy, pero no toca por qué esta colonia se enferma más que otras." },
      { id: "brigadas", texto: "Apoyar las brigadas vecinales de limpieza de criaderos", actor: "Sociedad civil", escala: "Local", icono: "fa-broom", estructural: false, efecto: { casos: -10, confianza: 8, conflictividad: -3 }, porque: "Genera confianza y comunidad; ayuda, pero depende del tiempo libre de quienes ya están sobrecargados." },
      { id: "modulo", texto: "Abrir un módulo de salud de primer contacto en la colonia", actor: "Estado", escala: "Local", icono: "fa-house-medical", estructural: true, efecto: { casos: -14, confianza: 5, conflictividad: -2 }, porque: "Ataca la causa de fondo (acceso a salud) y no solo el síntoma; por eso rinde más si entendiste las causas." },
      { id: "multar", texto: "Multar a quien tenga agua estancada", actor: "Estado", escala: "Local", icono: "fa-ticket", estructural: false, efecto: { casos: -4, confianza: -10, conflictividad: 10 }, porque: "Culpa a las personas por almacenar agua que el servicio no les da: es violencia estructural y rompe la confianza." },
    ],
  },
  {
    id: "mercado", mes: 3, titulo: "La fábrica no reabre y el mercado sigue cerrado", icono: "fa-store-slash", foto: "fabrica-cerrada",
    texto: "Cientos de familias informales no han tenido ingreso en un mes.",
    opciones: [
      { id: "reapertura", texto: "Negociar con la empresa una reapertura gradual y con protocolos", actor: "Sector empresarial", escala: "Local", icono: "fa-industry", estructural: false, efecto: { casos: 8, empleo: 10, confianza: 3, conflictividad: -3 }, porque: "Reactiva empleo formal, pero reabrir aumenta contagios y deja fuera a quienes trabajan sin contrato." },
      { id: "apoyo", texto: "Dar apoyo económico temporal a trabajadores informales con padrón abierto", actor: "Estado", escala: "Nacional", icono: "fa-hand-holding-dollar", estructural: true, efecto: { casos: -3, empleo: 6, confianza: 8, conflictividad: -8 }, porque: "Cubre el hueco de quienes no tienen seguro ni prestaciones: toca la informalidad, causa de fondo." },
      { id: "cierre", texto: "Mantener el cierre total sin apoyos", actor: "Estado", escala: "Local", icono: "fa-lock", estructural: false, efecto: { casos: -10, empleo: -15, confianza: -6, conflictividad: 12 }, porque: "Baja los contagios, pero castiga a quienes no pueden quedarse en casa sin ingreso: la crisis se vive de forma desigual." },
      { id: "cocina", texto: "Impulsar cocinas comunitarias y mercado en plazas abiertas", actor: "Sociedad civil", escala: "Local", icono: "fa-bowl-food", estructural: false, efecto: { casos: 0, empleo: 4, confianza: 6, conflictividad: -4 }, porque: "Es una red de apoyo mutuo útil, pero es parcial: no sustituye una protección laboral." },
    ],
  },
  {
    id: "marcha", mes: 4, titulo: "Marcha por falta de medicinas", icono: "fa-bullhorn", foto: "marcha-clinica",
    texto: "Familias exigen medicinas frente a la presidencia municipal.",
    opciones: [
      { id: "mesa", texto: "Instalar una mesa de diálogo y coordinar el abasto entre las instituciones públicas de salud", actor: "Estado", escala: "Nacional", icono: "fa-people-arrows", estructural: true, efecto: { casos: -8, confianza: 10, conflictividad: -12 }, porque: "Enfrenta la fragmentación del sistema de salud y le da voz a quien exige: ataca causa y conflicto." },
      { id: "comunicado", texto: "Publicar un comunicado: «todo está bajo control»", actor: "Estado", escala: "Local", icono: "fa-file-lines", estructural: false, efecto: { casos: 0, confianza: -8, conflictividad: 8 }, porque: "Negar lo que la gente ve erosiona la confianza y empuja la protesta." },
      { id: "organismos", texto: "Pedir medicinas y guías a organismos internacionales", actor: "Organismos internacionales", escala: "Global", icono: "fa-earth-americas", estructural: false, efecto: { casos: -6, confianza: 2, conflictividad: -2 }, porque: "La ayuda global orienta, pero llega tarde y no resuelve el abasto local." },
      { id: "farmacia", texto: "Apoyar una colecta y farmacia solidaria vecinal", actor: "Sociedad civil", escala: "Local", icono: "fa-pills", estructural: false, efecto: { casos: -3, confianza: 5, conflictividad: -5 }, porque: "Responde donde el Estado no llega, aunque es una solución de emergencia." },
    ],
  },
];

export interface Serie {
  /** Casos por mes decidido (mes 1 siempre; luego uno por decisión). */
  casos: number[];
  ind: Indicadores;
  /** Efecto neto de cada decisión tomada (para mostrar «+8 / −10»). */
  deltas: { eventoId: string; opcionId: string; d: Partial<Indicadores> & { casos: number }; bonus: boolean }[];
  meses: number;
}

const acota = (n: number) => Math.max(0, Math.min(100, n));

export function simular(decs: Record<string, string>, alerta: number, enfoque: boolean): Serie {
  const ind: Indicadores = { ...INICIO };
  const casos: number[] = [Math.round(CASOS_BASE[0]! * (1 - 0.25 * alerta))];
  const deltas: Serie["deltas"] = [];
  let factor = 1;
  let meses = 0;
  for (let i = 0; i < EVENTOS.length; i++) {
    const ev = EVENTOS[i]!;
    const op = ev.opciones.find((o) => o.id === decs[ev.id]);
    if (!op) break;
    const bonus = op.estructural && enfoque;
    const k = (n: number, bueno: boolean) => (bonus && bueno ? n * 1.5 : n);
    const d = {
      casos: k(op.efecto.casos, op.efecto.casos < 0),
      empleo: k(op.efecto.empleo ?? 0, (op.efecto.empleo ?? 0) > 0),
      confianza: k(op.efecto.confianza ?? 0, (op.efecto.confianza ?? 0) > 0),
      conflictividad: k(op.efecto.conflictividad ?? 0, (op.efecto.conflictividad ?? 0) < 0),
    };
    ind.empleo = acota(ind.empleo + d.empleo + DERIVA.empleo);
    ind.confianza = acota(ind.confianza + d.confianza + DERIVA.confianza);
    ind.conflictividad = acota(ind.conflictividad + d.conflictividad + DERIVA.conflictividad);
    factor *= 1 + d.casos / 100;
    casos.push(Math.round(CASOS_BASE[i + 1]! * (1 - 0.25 * alerta) * factor));
    deltas.push({ eventoId: ev.id, opcionId: op.id, d, bonus });
    meses++;
  }
  return { casos, ind, deltas, meses };
}

export interface Desenlace {
  id: "contenida" | "amortiguada" | "profunda";
  titulo: string;
  texto: string;
  tono: "bien" | "medio" | "mal";
}

export function desenlace(s: Serie): Desenlace {
  const { confianza, conflictividad } = s.ind;
  if (confianza >= 70 && conflictividad <= 25) {
    return { id: "contenida", tono: "bien", titulo: "Crisis contenida", texto: "Atacaste las causas de fondo y diste voz a quienes la padecían: la confianza se sostuvo y el conflicto bajó. Una crisis no se apaga solo con apagar el síntoma." };
  }
  if (confianza >= 55 && conflictividad <= 40) {
    return { id: "amortiguada", tono: "medio", titulo: "Crisis amortiguada", texto: "Evitaste lo peor, pero quedaron causas sin atender: la próxima crisis encontrará la misma vulnerabilidad." };
  }
  return { id: "profunda", tono: "mal", titulo: "Crisis profunda", texto: "Las respuestas apagaron síntomas o culparon a las personas: la desconfianza y el conflicto crecieron. Sin tocar las estructuras, la crisis se repite." };
}
