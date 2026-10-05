/**
 * Simulador del buscador — lógica pura (sin React) de LabBusquedaConfiable.
 *
 * Escenario (SIMULACIÓN): una tarea de Cultura Digital — «¿Cuántas horas debe
 * dormir un adolescente y cómo afecta su rendimiento escolar?». El alumno arma
 * una consulta (palabras clave + operadores), el buscador FICTICIO devuelve
 * una página de resultados que cambia con cada decisión, y cada resultado se
 * evalúa con los cinco criterios de la lectura (autor, fecha, citas, tono y
 * lateral reading). Revisar cuesta tiempo: no se alcanza a revisar todo.
 *
 * Todos los sitios, personas y cifras son inventados. Los dominios usan
 * nombres de fantasía; no corresponden a ningún sitio real.
 */

export type Dominio = "edu" | "gob" | "org" | "com" | "blog";
export type Tono = "neutral" | "alarmista";
export type Proposito = "informar" | "opinar" | "persuadir" | "vender" | "clics";
export type Criterio = "autor" | "fecha" | "citas" | "tono" | "lateral";

export interface Palabra {
  id: string;
  txt: string;
}

/** Palabras clave que el alumno puede poner en la consulta. */
export const PALABRAS: Palabra[] = [
  { id: "sueno", txt: "sueño" },
  { id: "adolescentes", txt: "adolescentes" },
  { id: "horas", txt: "horas" },
  { id: "rendimiento", txt: "rendimiento escolar" },
  { id: "celular", txt: "celular de noche" },
  { id: "pastillas", txt: "pastillas para dormir" },
];

export interface Fuente {
  id: string;
  sitio: string;
  tipoSitio: string;
  titulo: string;
  fragmento: string;
  dominio: Dominio;
  anio: number;
  /** Nombre y credenciales; null si no hay autor. */
  autor: string | null;
  autorVerificable: boolean;
  citas: number;
  tono: Tono;
  proposito: Proposito;
  /** Qué dicen otras fuentes sobre el sitio (lateral reading). */
  reputacion: string;
  /** Etiquetas con las que el buscador la encuentra. «milagro» sirve al operador «-». */
  tags: string[];
  /** Clave de la miniatura (/media/labs-sim/busqueda-confiable/<clave>.webp). */
  imagen: string;
  icono: string;
}

export const ANIO_SIMULADO = 2026;

export const FUENTES: Fuente[] = [
  {
    id: "f1", sitio: "sueno.uvalle-demo.edu.mx", tipoSitio: "Instituto universitario ficticio",
    titulo: "Horas de sueño recomendadas en la adolescencia",
    fragmento: "Revisión de estudios sobre cuántas horas necesita el cuerpo adolescente y su relación con la atención en clase.",
    dominio: "edu", anio: 2025, autor: "Dra. Marisol Quintero Arce, investigadora del Instituto del Sueño del Valle", autorVerificable: true,
    citas: 6, tono: "neutral", proposito: "informar",
    reputacion: "Otras fuentes la describen como un centro universitario con publicaciones revisadas por pares.",
    tags: ["sueno", "adolescentes", "horas", "rendimiento"], imagen: "laboratorio-sueno", icono: "fa-flask",
  },
  {
    id: "f2", sitio: "salud.valledelsol-demo.gob.mx", tipoSitio: "Dirección de salud estatal ficticia",
    titulo: "Guía para familias: dormir bien en la adolescencia",
    fragmento: "Recomendaciones de la Dirección de Salud Escolar con rangos de horas por edad y señales de falta de sueño.",
    dominio: "gob", anio: 2024, autor: "Dirección de Salud Escolar (equipo médico firmante)", autorVerificable: true,
    citas: 4, tono: "neutral", proposito: "informar",
    reputacion: "Otras fuentes la reconocen como dependencia pública; sus guías citan estudios consultables.",
    tags: ["sueno", "adolescentes", "horas"], imagen: "adolescente-durmiendo", icono: "fa-landmark",
  },
  {
    id: "f3", sitio: "ciencia-cotidiana-demo.org", tipoSitio: "Revista de divulgación ficticia",
    titulo: "¿Por qué los adolescentes se duermen tarde? Lo que dice la ciencia",
    fragmento: "Reportaje con entrevistas a especialistas y enlaces a los artículos que comenta.",
    dominio: "org", anio: 2023, autor: "Rodrigo Palma, periodista de ciencia con trayectoria comprobable", autorVerificable: true,
    citas: 3, tono: "neutral", proposito: "informar",
    reputacion: "Otras fuentes la mencionan como revista de divulgación con corrección de estilo y fe de erratas.",
    tags: ["sueno", "adolescentes", "rendimiento", "celular"], imagen: "cafe-laptop-noche", icono: "fa-newspaper",
  },
  {
    id: "f4", sitio: "repositorio.uvalle-demo.edu.mx", tipoSitio: "Repositorio universitario ficticio",
    titulo: "Sueño y calificaciones en bachillerato: estudio de seguimiento",
    fragmento: "Estudio con 900 estudiantes (datos de simulación) que compara horas de sueño y promedio escolar.",
    dominio: "edu", anio: 2019, autor: "Dr. Hugo Beltrán Lara, docente-investigador", autorVerificable: true,
    citas: 9, tono: "neutral", proposito: "informar",
    reputacion: "Otras fuentes lo citan, pero señalan que su muestra es anterior a la popularización del celular entre jóvenes.",
    tags: ["sueno", "rendimiento", "adolescentes"], imagen: "mochila-libros", icono: "fa-graduation-cap",
  },
  {
    id: "f5", sitio: "mivida-sinsueno-demo.blog", tipoSitio: "Blog personal ficticio",
    titulo: "Yo duermo 4 horas y me va perfecto: mi método",
    fragmento: "Un bloguero cuenta su experiencia y asegura que dormir poco «es cuestión de actitud».",
    dominio: "blog", anio: 2025, autor: null, autorVerificable: false,
    citas: 0, tono: "neutral", proposito: "opinar",
    reputacion: "No hay otras fuentes que hablen del sitio; no se puede saber quién lo escribe.",
    tags: ["sueno", "horas"], imagen: "reloj-despertador", icono: "fa-pen-nib",
  },
  {
    id: "f6", sitio: "superdormir-ya-demo.com", tipoSitio: "Tienda en línea ficticia",
    titulo: "¡INCREÍBLE! La pastilla milagro que te hace dormir 3 horas y rendir al doble",
    fragmento: "«Los doctores no quieren que lo sepas». Compra hoy con 70 % de descuento (cifra de simulación).",
    dominio: "com", anio: 2025, autor: null, autorVerificable: false,
    citas: 0, tono: "alarmista", proposito: "vender",
    reputacion: "Otras fuentes lo señalan como sitio de ventas con promesas que no se pueden comprobar.",
    tags: ["milagro", "pastillas", "sueno", "horas", "rendimiento"], imagen: "frasco-pastillas", icono: "fa-pills",
  },
  {
    id: "f7", sitio: "alertaya24-demo.com", tipoSitio: "Sitio de noticias ficticio",
    titulo: "TUS HIJOS ESTÁN EN PELIGRO: el celular les roba el sueño y NADIE lo dice",
    fragmento: "Texto en mayúsculas, sin nombres ni estudios, que pide «compartir antes de que lo borren».",
    dominio: "com", anio: 2026, autor: null, autorVerificable: false,
    citas: 0, tono: "alarmista", proposito: "clics",
    reputacion: "Otras fuentes lo han desmentido varias veces por publicar noticias sin verificar.",
    tags: ["celular", "sueno", "adolescentes"], imagen: "celular-cama-oscuro", icono: "fa-mobile-screen",
  },
  {
    id: "f8", sitio: "colchonesmax-demo.com", tipoSitio: "Tienda de colchones ficticia",
    titulo: "Cuántas horas necesitas dormir (y el colchón ideal para ti)",
    fragmento: "Artículo del blog comercial que da cifras de horas y termina recomendando un colchón de la marca.",
    dominio: "com", anio: 2026, autor: "Equipo de marketing de la tienda", autorVerificable: false,
    citas: 0, tono: "neutral", proposito: "vender",
    reputacion: "Otras fuentes la identifican como una empresa; sus artículos sirven para vender sus productos.",
    tags: ["sueno", "horas", "pastillas"], imagen: "reloj-despertador", icono: "fa-bed",
  },
  {
    id: "f9", sitio: "diario-del-valle-demo.com", tipoSitio: "Periódico regional ficticio",
    titulo: "Estudiantes que duermen menos de 7 horas reprueban más, dice un estudio",
    fragmento: "Nota con la voz de dos docentes y un enlace al estudio que comenta.",
    dominio: "com", anio: 2025, autor: "Paola Ibarra, reportera de educación", autorVerificable: true,
    citas: 2, tono: "neutral", proposito: "informar",
    reputacion: "Otras fuentes la consideran un diario con sección de verificación y correcciones públicas.",
    tags: ["sueno", "adolescentes", "rendimiento", "celular"], imagen: "salon-somnoliento", icono: "fa-newspaper",
  },
  {
    id: "f10", sitio: "preguntasychismes-demo.com", tipoSitio: "Foro abierto ficticio",
    titulo: "¿Alguien más se duerme en clase? Cuéntenme sus trucos",
    fragmento: "Hilo con cientos de respuestas anónimas; cada quien dice lo que le funciona.",
    dominio: "com", anio: 2022, autor: null, autorVerificable: false,
    citas: 0, tono: "neutral", proposito: "opinar",
    reputacion: "Otras fuentes advierten que cualquier persona puede publicar aquí con un seudónimo.",
    tags: ["sueno", "adolescentes", "horas", "celular"], imagen: "salon-somnoliento", icono: "fa-comments",
  },
  {
    id: "f11", sitio: "fundacion-descanso-demo.org", tipoSitio: "Asociación civil ficticia",
    titulo: "Campaña «Duerme mejor, estudia mejor»",
    fragmento: "Folleto de una asociación que ofrece talleres de pago y menciona un estudio sin dar la referencia.",
    dominio: "org", anio: 2023, autor: "Fundación Descanso A. C.", autorVerificable: false,
    citas: 1, tono: "neutral", proposito: "persuadir",
    reputacion: "Otras fuentes la describen como una asociación pequeña; sus talleres se pagan y no hay evaluación externa.",
    tags: ["sueno", "adolescentes", "rendimiento", "pastillas"], imagen: "mochila-libros", icono: "fa-hand-holding-heart",
  },
  {
    id: "f12", sitio: "estadistica.valledelsol-demo.gob.mx", tipoSitio: "Oficina de estadística ficticia",
    titulo: "Encuesta de hábitos de sueño en jóvenes (levantamiento 2018)",
    fragmento: "Tabulados con horas de sueño por edad. Cifras de simulación; no corresponden a datos reales.",
    dominio: "gob", anio: 2018, autor: "Oficina de Estadística, equipo técnico (metodología publicada)", autorVerificable: true,
    citas: 5, tono: "neutral", proposito: "informar",
    reputacion: "Otras fuentes la usan como referencia, aunque recuerdan que los datos tienen ya varios años.",
    tags: ["sueno", "adolescentes", "horas"], imagen: "laboratorio-sueno", icono: "fa-chart-simple",
  },
];

export const CRITERIOS_REVISION: { id: Criterio; txt: string; icono: string; costo: number }[] = [
  { id: "autor", txt: "Autor", icono: "fa-user-pen", costo: 1 },
  { id: "fecha", txt: "Fecha", icono: "fa-calendar", costo: 1 },
  { id: "citas", txt: "Citas", icono: "fa-quote-right", costo: 2 },
  { id: "tono", txt: "Tono", icono: "fa-bullhorn", costo: 1 },
  { id: "lateral", txt: "Lateral reading", icono: "fa-arrows-left-right", costo: 3 },
];

export const TIEMPO_TOTAL = 20;
export const UMBRAL_CONFIABLE = 70;
export const MIN_FUENTES = 3;
export const NOTA_META = 8;

/* ── Consulta ─────────────────────────────────────────────────────────── */

export interface Consulta {
  palabras: string[];
  /** Comillas: todas las palabras deben aparecer en el resultado. */
  comillas: boolean;
  /** site:.edu / .gob / .org — restringe el dominio. */
  dominio: "" | "edu" | "gob" | "org";
  /** -milagro — excluye lo que se anuncia como «milagro». */
  excluirMilagro: boolean;
  /** after:2022 — solo resultados recientes. */
  reciente: boolean;
}

export const CONSULTA_VACIA: Consulta = { palabras: [], comillas: false, dominio: "", excluirMilagro: false, reciente: false };

export function operadoresActivos(c: Consulta): number {
  return (c.comillas ? 1 : 0) + (c.dominio ? 1 : 0) + (c.excluirMilagro ? 1 : 0) + (c.reciente ? 1 : 0);
}

/** La consulta como la escribiría en el buscador. */
export function consultaTexto(c: Consulta): string {
  const txt = c.palabras.map((id) => PALABRAS.find((p) => p.id === id)?.txt ?? id);
  const base = c.comillas && txt.length > 0 ? `"${txt.join(" ")}"` : txt.join(" ");
  const ops = [c.dominio ? `site:.${c.dominio}` : "", c.excluirMilagro ? "-milagro" : "", c.reciente ? "after:2022" : ""].filter(Boolean);
  return [base, ...ops].filter(Boolean).join(" ");
}

/**
 * Qué devuelve el buscador. Sin comillas basta que aparezca UNA palabra (más
 * ruido); con comillas deben aparecer TODAS. Se ordena por coincidencias.
 */
export function buscar(c: Consulta): Fuente[] {
  if (c.palabras.length === 0) return [];
  const orden = new Map(FUENTES.map((f, i) => [f.id, i]));
  return FUENTES.map((f) => ({ f, coincide: c.palabras.filter((p) => f.tags.includes(p)).length }))
    .filter(({ f, coincide }) => {
      if (coincide === 0) return false;
      if (c.comillas && coincide < c.palabras.length) return false;
      if (c.dominio && f.dominio !== c.dominio) return false;
      if (c.excluirMilagro && f.tags.includes("milagro")) return false;
      if (c.reciente && f.anio < 2022) return false;
      return true;
    })
    .sort((a, b) => b.coincide - a.coincide || (orden.get(a.f.id) ?? 0) - (orden.get(b.f.id) ?? 0))
    .slice(0, 8)
    .map((x) => x.f);
}

/* ── Calidad real de una fuente ───────────────────────────────────────── */

export interface Desglose {
  puntos: number;
  confiable: boolean;
  aciertos: string[];
  alertas: string[];
}

export function calidadFuente(f: Fuente): Desglose {
  let p = 0;
  const aciertos: string[] = [];
  const alertas: string[] = [];

  if (f.autor && f.autorVerificable) { p += 25; aciertos.push("tiene autor con credenciales verificables"); }
  else if (f.autor) { p += 10; alertas.push("el autor no se puede verificar"); }
  else alertas.push("no tiene autor identificado");

  if (f.citas >= 3) { p += 20; aciertos.push(`cita ${f.citas} fuentes que se pueden comprobar`); }
  else if (f.citas > 0) { p += 10; alertas.push(`solo cita ${f.citas === 1 ? "una fuente, sin referencia completa" : `${f.citas} fuentes`}`); }
  else alertas.push("no cita ninguna fuente");

  const edad = ANIO_SIMULADO - f.anio;
  if (edad <= 4) { p += 15; aciertos.push(`es reciente (${f.anio})`); }
  else if (edad <= 6) { p += 8; alertas.push(`tiene ${edad} años (${f.anio}): puede estar desactualizada`); }
  else { p += 3; alertas.push(`tiene ${edad} años (${f.anio}): probablemente desactualizada`); }

  if (f.dominio === "edu" || f.dominio === "gob") { p += 15; aciertos.push(`su dominio .${f.dominio} es institucional`); }
  else if (f.dominio === "org") { p += 10; aciertos.push("su dominio .org es de una organización, hay que revisar cuál"); }
  else if (f.dominio === "com") { p += 3; alertas.push("su dominio .com es comercial: no dice nada de su calidad"); }
  else alertas.push("es un blog personal sin verificación");

  if (f.tono === "neutral") { p += 15; aciertos.push("su tono es sobrio"); }
  else alertas.push("usa lenguaje alarmista o extremo");

  if (f.proposito === "informar") { p += 10; aciertos.push("su propósito es informar"); }
  else if (f.proposito === "opinar") { p += 4; alertas.push("es una opinión personal, no evidencia"); }
  else if (f.proposito === "persuadir") { p += 4; alertas.push("busca persuadir, no solo informar"); }
  else alertas.push(f.proposito === "vender" ? "su propósito es vender" : "su propósito es conseguir clics");

  return { puntos: p, confiable: p >= UMBRAL_CONFIABLE, aciertos, alertas };
}

export type Veredicto = "usar" | "descartar";

/** ¿La decisión fue la acertada? */
export function veredictoCorrecto(f: Fuente, v: Veredicto): boolean {
  return calidadFuente(f).confiable === (v === "usar");
}

/** Texto de retroalimentación: explica POR QUÉ, con lo que se vio y lo que no. */
export function retroVeredicto(f: Fuente, v: Veredicto, revisados: Criterio[]): string {
  const d = calidadFuente(f);
  const ok = veredictoCorrecto(f, v);
  const razones = (d.confiable ? d.aciertos : d.alertas).slice(0, 3).join("; ");
  const faltan = CRITERIOS_REVISION.filter((c) => !revisados.includes(c.id)).length;
  const nota = faltan >= 4 ? " Decidiste casi sin revisar: así se cuelan las fuentes malas." : "";
  if (ok && v === "usar") return `Buena elección (${d.puntos}/100): ${razones}.${nota}`;
  if (ok) return `Bien descartada (${d.puntos}/100): ${razones}.${nota}`;
  if (v === "usar") return `Cuidado: era poco confiable (${d.puntos}/100). ${razones}.${nota}`;
  return `La descartaste, pero era confiable (${d.puntos}/100): ${razones}. Una buena fuente que se pierde es evidencia menos para tu trabajo.`;
}

/* ── La tarea ─────────────────────────────────────────────────────────── */

export interface Tarea {
  usadas: Fuente[];
  /** Promedio de calidad (0-100) de las fuentes elegidas. */
  calidad: number;
  nota: number;
  faltan: number;
  institucional: boolean;
  comentario: string;
}

export function evaluarTarea(ids: string[]): Tarea {
  const usadas = ids.map((id) => FUENTES.find((f) => f.id === id)).filter((f): f is Fuente => !!f);
  if (usadas.length === 0) {
    return { usadas, calidad: 0, nota: 0, faltan: MIN_FUENTES, institucional: false, comentario: "Aún no has elegido fuentes para tu trabajo." };
  }
  const calidad = Math.round(usadas.reduce((s, f) => s + calidadFuente(f).puntos, 0) / usadas.length);
  const faltan = Math.max(0, MIN_FUENTES - usadas.length);
  const institucional = usadas.some((f) => ["edu", "gob", "org"].includes(f.dominio) && calidadFuente(f).confiable);
  let nota = calidad / 10 - (faltan > 0 ? 2 : 0) - (institucional ? 0 : 1);
  nota = Math.max(0, Math.min(10, Math.round(nota * 10) / 10));
  const partes: string[] = [];
  if (faltan > 0) partes.push(`Te faltan ${faltan} fuente${faltan > 1 ? "s" : ""}: la maestra pide al menos ${MIN_FUENTES} (−2 puntos)`);
  if (!institucional) partes.push("Ninguna fuente institucional confiable (−1 punto)");
  const flojas = usadas.filter((f) => !calidadFuente(f).confiable).length;
  if (flojas > 0) partes.push(`${flojas} de tus fuentes no es confiable y baja el promedio`);
  if (partes.length === 0) partes.push("Fuentes variadas, verificables y recientes");
  return { usadas, calidad, nota, faltan, institucional, comentario: partes.join(". ") + "." };
}

/** Información que revela cada criterio al revisarlo. */
export function datoCriterio(f: Fuente, c: Criterio): { etiqueta: string; texto: string; bueno: boolean } {
  switch (c) {
    case "autor":
      return f.autor
        ? { etiqueta: "Autor", texto: f.autor, bueno: f.autorVerificable }
        : { etiqueta: "Autor", texto: "No aparece ningún autor.", bueno: false };
    case "fecha": {
      const edad = ANIO_SIMULADO - f.anio;
      return { etiqueta: "Fecha", texto: `Publicado en ${f.anio} (hace ${edad === 0 ? "menos de un año" : `${edad} año${edad > 1 ? "s" : ""}`}).`, bueno: edad <= 4 };
    }
    case "citas":
      return { etiqueta: "Citas", texto: f.citas === 0 ? "No cita ninguna fuente." : `Cita ${f.citas} fuente${f.citas > 1 ? "s" : ""}${f.citas >= 3 ? " con referencia completa" : ""}.`, bueno: f.citas >= 3 };
    case "tono":
      return { etiqueta: "Tono", texto: f.tono === "alarmista" ? "Lenguaje alarmista: mayúsculas, urgencia y promesas." : "Lenguaje sobrio y descriptivo.", bueno: f.tono === "neutral" };
    case "lateral":
      return { etiqueta: "Lateral reading", texto: f.reputacion, bueno: !/vent|desmint|no hay otras|cualquier persona|empresa|no se puede/i.test(f.reputacion) };
  }
}
