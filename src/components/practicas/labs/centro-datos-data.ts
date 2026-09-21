/**
 * Datos y modelo del laboratorio "Centros de datos y la huella de la nube"
 * (CD-I-P03, progresión 3 de Cultura Digital I — Ciudadanía digital).
 *
 * Propósito: analizar de manera crítica el impacto que tienen el uso de las
 * tecnologías digitales —y las políticas relacionadas con la disponibilidad y
 * gestión de la información— en las personas y en las comunidades.
 *
 * Anclas (contenido VERBATIM de la base de datos):
 *   - A1 lectura «¿Quién controla la información en internet?»: marco teórico
 *     (3 párrafos), recuadro y preguntas de comprensión.
 *   - A2 quiz «Datos, poder y colonialismo digital»: reto evaluable.
 *   - A3 reflexión «Mis datos: ¿quién los tiene?»: panel de reflexión.
 *   - A4 verdadero/falso: hechos. A5 glosario: 4 términos. A6 completa el texto.
 *   - A9 relacionar columnas: inspira la tarjeta de estrellas (situación → concepto).
 *
 * Tres modos que no se repiten entre sí:
 *   (1) Dentro de la nube — un campus de centros de datos en Querétaro: el
 *       alumno elige cómo enfriarlo y ve el intercambio agua ↔ electricidad.
 *       Modelo físico simplificado (calor latente del agua, COP tipo Carnot).
 *   (2) Tu huella de datos — un día con cinco apps: el alumno decide los
 *       permisos y ve qué datos salen, a quién llegan y qué se puede inferir.
 *   (3) Brecha digital — un trámite «solo en línea» frente a cuatro grupos de
 *       población con el acceso real de la ENDUTIH 2025; el alumno diseña la
 *       política pública para que nadie quede fuera.
 *
 * Cifras reales verificadas (con fuente y año) están marcadas como tales; los
 * parámetros de los modelos que no provienen de una fuente son ILUSTRATIVOS y
 * así se declara en la nota al pie del laboratorio.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "centro" | "huella" | "brecha";
export const MODOS: Modo[] = ["centro", "huella", "brecha"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  centro: { etq: "Dentro de la nube", subtitulo: "Agua y electricidad de un centro de datos", icono: "fa-server", color: "#38bdf8" },
  huella: { etq: "Tu huella de datos", subtitulo: "Permisos, datos y quién los recibe", icono: "fa-fingerprint", color: "#c084fc" },
  brecha: { etq: "Brecha digital", subtitulo: "Un trámite solo en línea y quién queda fuera", icono: "fa-people-arrows", color: "#fbbf24" },
};

export function num(x: number, dec = 0): string {
  const s = Math.abs(x).toFixed(dec);
  const [ent, frac] = s.split(".");
  const conMiles = ent!.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${x < 0 ? "−" : ""}${conMiles}${frac ? `.${frac}` : ""}`;
}

export const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

export function mulberry32(semilla: number) {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. DENTRO DE LA NUBE — centro de datos
 * ════════════════════════════════════════════════════════════════════════ */

export type Enfriamiento = "torre" | "seco" | "adiabatico";
export const ENFRIAMIENTOS: Enfriamiento[] = ["torre", "seco", "adiabatico"];

export const ENFRIAMIENTO_DEF: Record<Enfriamiento, { etq: string; corto: string; icono: string; explica: string }> = {
  torre: {
    etq: "Enfriadoras con torre evaporativa",
    corto: "Torre evaporativa",
    icono: "fa-water",
    explica: "Un compresor enfría agua para los servidores y el calor se tira evaporando agua en una torre. Gasta poca electricidad, pero cada megawatt-hora de calor evapora cerca de 1.5 toneladas de agua.",
  },
  seco: {
    etq: "Enfriadoras por aire (circuito cerrado)",
    corto: "Enfriado por aire",
    icono: "fa-fan",
    explica: "El calor se tira con ventiladores, como el radiador de un coche. Casi no usa agua en el sitio, pero en días calurosos el compresor trabaja mucho más y la cuenta de electricidad sube.",
  },
  adiabatico: {
    etq: "Aire exterior + enfriamiento evaporativo",
    corto: "Aire exterior",
    icono: "fa-wind",
    explica: "Si afuera está fresco, se usa el aire exterior filtrado. Si hace calor, se humedece el aire para enfriarlo y solo entonces se gasta agua. Aprovecha que el clima semiárido tiene aire seco.",
  },
};

/** Calor latente de vaporización del agua a ~30 °C (MJ/kg). */
export const H_FG = 2.43;
/** Ciclos de concentración de la torre: el agua de reposición es E·C/(C−1). */
export const CICLOS = 4;
/** Pérdidas eléctricas (UPS, transformadores) como fracción de la carga de TI. Ilustrativo (típico 5–10 %). */
export const PERDIDAS = 0.06;
/** Iluminación y otros servicios. Ilustrativo. */
export const OTROS = 0.01;
/** Aumento de temperatura del aire al atravesar los servidores (K). */
export const DT_RACK = 12;
/** Rango recomendado de temperatura de entrada a los servidores (ASHRAE, clase A1). */
export const T_RECOM_MIN = 18;
export const T_RECOM_MAX = 27;
export const T_SET_MIN = 16;
export const T_SET_MAX = 32;
/** Factor de emisión del Sistema Eléctrico Nacional 2024 (CRE/SEMARNAT, aviso del 28 feb 2025). */
export const FACTOR_EMISION = 0.444;
/** Agua para las necesidades básicas de una persona: 50–100 L/día (OMS). Se usa el valor alto. */
export const LITROS_PERSONA_DIA = 100;

/** Temperatura de bulbo húmedo aproximada para un clima semiárido de altiplano (ilustrativa). */
export function bulboHumedo(tExt: number): number {
  return tExt - (4 + 0.3 * Math.max(0, tExt - 10));
}

const kelvin = (c: number) => c + 273.15;

/** COP de un compresor: fracción de Carnot, acotado a valores reales. */
export function cop(tFrio: number, tCaliente: number, min: number, max: number): number {
  const salto = Math.max(0.5, tCaliente - tFrio);
  return clamp((0.5 * kelvin(tFrio)) / salto, min, max);
}

/** Paso suave de 0 a 1 entre a y b (evita saltos al activar un economizador). */
function paso(x: number, a: number, b: number): number {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

export interface EstadoEnfriamiento {
  /** Potencia de enfriamiento como fracción de la carga de TI. */
  enfr: number;
  /** Litros de agua por MWh de electricidad de TI. */
  litrosPorMWh: number;
  /** Qué está haciendo el sistema. */
  regimen: "libre" | "evaporativo" | "compresor" | "mixto";
  cop: number | null;
}

/**
 * Estado instantáneo del sistema de enfriamiento para una temperatura exterior
 * y una temperatura de pasillo frío (entrada a los servidores).
 * Modelo físico simplificado: todo lo que consume el centro se convierte en calor.
 */
export function enfriamiento(tipo: Enfriamiento, tExt: number, tSet: number): EstadoEnfriamiento {
  const calor = 1 + PERDIDAS + OTROS; // MWh de calor por MWh de TI
  const tbh = bulboHumedo(tExt);
  const mjPorMWh = 3600;
  if (tipo === "torre") {
    const tAguaFria = tSet - 6;
    // Economizador: la torre sola alcanza el agua fría si el bulbo húmedo es bajo.
    const libre = 1 - paso(tbh + 5, tAguaFria - 3, tAguaFria);
    const c = cop(tAguaFria, tbh + 10, 3, 7.5);
    const compresor = (1 - libre) * (calor / c);
    const enfr = 0.05 + compresor;
    const calorTorre = calor + compresor;
    const evaporada = ((calorTorre * mjPorMWh) / H_FG) * 0.9; // 90 % del calor se va como vapor
    const litros = (evaporada * CICLOS) / (CICLOS - 1);
    return { enfr, litrosPorMWh: litros, regimen: libre > 0.95 ? "libre" : libre > 0.05 ? "mixto" : "compresor", cop: libre > 0.95 ? null : c };
  }
  if (tipo === "seco") {
    const tAguaFria = tSet - 6;
    const libre = 1 - paso(tExt + 6, tAguaFria - 3, tAguaFria);
    const c = cop(tAguaFria, tExt + 12, 2, 6);
    const compresor = (1 - libre) * (calor / c);
    return { enfr: 0.08 + compresor, litrosPorMWh: 0, regimen: libre > 0.95 ? "libre" : libre > 0.05 ? "mixto" : "compresor", cop: libre > 0.95 ? null : c };
  }
  // Aire exterior + evaporativo directo
  if (tExt <= tSet - 1) return { enfr: 0.04, litrosPorMWh: 0, regimen: "libre", cop: null };
  const tEvap = tExt - 0.85 * (tExt - tbh);
  // Capacidad calorífica del caudal de aire (MJ/K): el aire absorbe el calor subiendo DT_RACK grados.
  const aire = (calor * mjPorMWh) / DT_RACK;
  if (tEvap <= tSet) {
    // Enfriar ese aire de tExt a tSet evapora agua: kg = MJ / h_fg.
    const evaporada = (aire * (tExt - tSet)) / H_FG;
    return { enfr: 0.05, litrosPorMWh: evaporada * 1.2, regimen: "evaporativo", cop: null };
  }
  // El evaporativo no alcanza: enfría lo que puede y un compresor hace el resto.
  const evaporada = (aire * (tExt - tEvap)) / H_FG;
  const resto = clamp((tEvap - tSet) / (tExt - tSet), 0, 1);
  const c = cop(tSet - 4, tExt + 12, 2, 6);
  return { enfr: 0.05 + resto * (calor / c), litrosPorMWh: evaporada * 1.2, regimen: "mixto", cop: c };
}

/** PUE instantáneo: energía total / energía de TI. */
export function pueInstantaneo(tipo: Enfriamiento, tExt: number, tSet: number): number {
  return 1 + PERDIDAS + OTROS + enfriamiento(tipo, tExt, tSet).enfr;
}

/**
 * Horas del año por temperatura exterior en un clima como el de Querétaro
 * (ILUSTRATIVO: promedio anual ≈ 18 °C; mayo es el mes más cálido con máxima
 * promedio de 29.8 °C y enero el más frío con mínima promedio de 6.1 °C).
 */
export const HORAS_CLIMA: { t: number; h: number }[] = [
  { t: 6, h: 700 },
  { t: 10, h: 1300 },
  { t: 14, h: 1760 },
  { t: 18, h: 1900 },
  { t: 22, h: 1600 },
  { t: 26, h: 1000 },
  { t: 30, h: 440 },
  { t: 33, h: 60 },
];
export const HORAS_ANIO = 8760;

export interface Anual {
  itMWh: number;
  totalMWh: number;
  pue: number;
  aguaM3: number;
  /** Litros por kWh de TI (WUE en sitio). */
  wue: number;
  co2t: number;
  personasAgua: number;
}

export function anual(tipo: Enfriamiento, itMW: number, tSet: number): Anual {
  let total = 0;
  let litros = 0;
  const it = itMW * HORAS_ANIO;
  for (const b of HORAS_CLIMA) {
    const e = enfriamiento(tipo, b.t, tSet);
    const itBin = itMW * b.h;
    total += itBin * (1 + PERDIDAS + OTROS + e.enfr);
    litros += itBin * e.litrosPorMWh;
  }
  const aguaM3 = litros / 1000;
  return {
    itMWh: it,
    totalMWh: total,
    pue: total / it,
    aguaM3,
    wue: litros / (it * 1000),
    co2t: total * FACTOR_EMISION,
    personasAgua: litros / (LITROS_PERSONA_DIA * 365),
  };
}

/** El reto de un campus en un municipio con acuífero en déficit. */
export const RETO_CENTRO = { itMW: 30, pueMax: 1.3, aguaMaxM3: 20000 };

export const T_EXT_MIN = 4;
export const T_EXT_MAX = 36;
export const IT_MIN = 5;
export const IT_MAX = 60;

/* ════════════════════════════════════════════════════════════════════════
 * 2. TU HUELLA DE DATOS — permisos y flujo de datos
 * ════════════════════════════════════════════════════════════════════════ */

export type Ubic = "siempre" | "uso" | "no";
export type PermisoBool = "contactos" | "fotos" | "microfono" | "rastreo";
export const PERMISOS_BOOL: PermisoBool[] = ["contactos", "fotos", "microfono", "rastreo"];

export const PERMISO_DEF: Record<PermisoBool | "ubicacion", { etq: string; icono: string; color: string }> = {
  ubicacion: { etq: "Ubicación", icono: "fa-location-dot", color: "#f87171" },
  contactos: { etq: "Contactos", icono: "fa-address-book", color: "#fbbf24" },
  fotos: { etq: "Fotos y videos", icono: "fa-images", color: "#34d399" },
  microfono: { etq: "Micrófono", icono: "fa-microphone", color: "#60a5fa" },
  rastreo: { etq: "Rastreo entre apps", icono: "fa-crosshairs", color: "#f472b6" },
};

export type AppId = "mapas" | "videos" | "mensajes" | "tienda" | "juego";
export const APPS_ORDEN: AppId[] = ["mapas", "videos", "mensajes", "tienda", "juego"];

export interface Permisos {
  ubicacion: Ubic;
  contactos: boolean;
  fotos: boolean;
  microfono: boolean;
  rastreo: boolean;
}

export interface AppDef {
  id: AppId;
  etq: string;
  icono: string;
  color: string;
  /** País de la sede de la empresa (ilustrativo, en la línea de la lectura A1). */
  sede: "EUA" | "China" | "México";
  /** ¿Vive de vender publicidad segmentada? */
  anuncios: boolean;
  /** Para qué la usas. */
  uso: string;
  /** Minutos de uso en el día modelo. */
  minutos: number;
  /** Lo que pide al instalarla. */
  pide: Permisos;
  /** Lo mínimo que necesita para cumplir su función. */
  necesita: Permisos;
  /** Por qué necesita (o no) cada permiso. */
  porque: Partial<Record<PermisoBool | "ubicacion", string>>;
}

const NADA: Permisos = { ubicacion: "no", contactos: false, fotos: false, microfono: false, rastreo: false };

export const APPS: Record<AppId, AppDef> = {
  mapas: {
    id: "mapas",
    etq: "Mapas y transporte",
    icono: "fa-map-location-dot",
    color: "#38bdf8",
    sede: "EUA",
    anuncios: true,
    uso: "Te guía en el camión a la escuela.",
    minutos: 40,
    pide: { ubicacion: "siempre", contactos: true, fotos: false, microfono: true, rastreo: true },
    necesita: { ...NADA, ubicacion: "uso" },
    porque: {
      ubicacion: "Necesita saber dónde estás, pero solo mientras la usas: «siempre» le deja registrar tu día entero, también de noche.",
      contactos: "Compartir tu ubicación con alguien no requiere entregarle tu agenda completa.",
      microfono: "Buscar por voz es opcional: puedes escribir el destino.",
      rastreo: "Guiarte no requiere seguirte a otras apps y sitios.",
    },
  },
  videos: {
    id: "videos",
    etq: "Red social de videos",
    icono: "fa-clapperboard",
    color: "#f472b6",
    sede: "China",
    anuncios: true,
    uso: "Ves videos en la comida y en la noche.",
    minutos: 110,
    pide: { ubicacion: "siempre", contactos: true, fotos: true, microfono: true, rastreo: true },
    necesita: NADA,
    porque: {
      ubicacion: "Ver videos no requiere tu ubicación.",
      contactos: "Tu agenda le sirve para sugerir cuentas y mapear tus relaciones, no para mostrarte videos.",
      fotos: "Solo haría falta al publicar, y puedes permitirlo en ese momento.",
      microfono: "Solo haría falta al grabar un video propio.",
      rastreo: "Seguirte fuera de la app sirve a los anunciantes, no a ti.",
    },
  },
  mensajes: {
    id: "mensajes",
    etq: "Mensajería",
    icono: "fa-comments",
    color: "#34d399",
    sede: "EUA",
    anuncios: false,
    uso: "Hablas con tu grupo y mandas notas de voz.",
    minutos: 60,
    pide: { ubicacion: "siempre", contactos: true, fotos: true, microfono: true, rastreo: false },
    necesita: { ...NADA, contactos: true, microfono: true },
    porque: {
      ubicacion: "Mandar mensajes no requiere tu ubicación; si quieres compartirla, se permite en ese momento.",
      contactos: "La usa para encontrar a tus conocidos. Es razonable, pero la empresa sí conoce tu red.",
      fotos: "Mandar una foto puede hacerse eligiéndola en el momento, sin abrirle toda la galería.",
      microfono: "Lo necesita para las notas de voz.",
    },
  },
  tienda: {
    id: "tienda",
    etq: "Tienda en línea",
    icono: "fa-bag-shopping",
    color: "#fbbf24",
    sede: "México",
    anuncios: true,
    uso: "Compras un regalo y lo mandas a tu casa.",
    minutos: 20,
    pide: { ubicacion: "siempre", contactos: true, fotos: false, microfono: false, rastreo: true },
    necesita: NADA,
    porque: {
      ubicacion: "La dirección de entrega se escribe; no necesita seguirte.",
      contactos: "Comprar no requiere tu agenda.",
      rastreo: "Seguirte a otras apps sirve para mostrarte anuncios de lo que viste.",
    },
  },
  juego: {
    id: "juego",
    etq: "Juego gratis con anuncios",
    icono: "fa-gamepad",
    color: "#a78bfa",
    sede: "EUA",
    anuncios: true,
    uso: "Juegas 20 minutos antes de dormir.",
    minutos: 30,
    pide: { ubicacion: "siempre", contactos: true, fotos: true, microfono: false, rastreo: true },
    necesita: NADA,
    porque: {
      ubicacion: "Un juego sin mapa no necesita tu ubicación: se la vende a redes de publicidad.",
      contactos: "Tu agenda no hace falta para jugar.",
      fotos: "No necesita tus fotos para jugar.",
      rastreo: "El rastreo es cómo el juego «gratis» se paga con tus datos.",
    },
  },
};

export const PERMISOS_TODO: Record<AppId, Permisos> = {
  mapas: { ...APPS.mapas.pide },
  videos: { ...APPS.videos.pide },
  mensajes: { ...APPS.mensajes.pide },
  tienda: { ...APPS.tienda.pide },
  juego: { ...APPS.juego.pide },
};

export const PERMISOS_NADA: Record<AppId, Permisos> = {
  mapas: { ...NADA },
  videos: { ...NADA },
  mensajes: { ...NADA },
  tienda: { ...NADA },
  juego: { ...NADA },
};

export function funciona(app: AppDef, p: Permisos): { ok: boolean; falta: string[] } {
  const falta: string[] = [];
  const n = app.necesita;
  if (n.ubicacion !== "no" && p.ubicacion === "no") falta.push(PERMISO_DEF.ubicacion.etq);
  for (const k of PERMISOS_BOOL) if (n[k] && !p[k]) falta.push(PERMISO_DEF[k].etq);
  return { ok: falta.length === 0, falta };
}

/** Permisos concedidos que la app no necesita. */
export function sobrantes(app: AppDef, p: Permisos): (PermisoBool | "ubicacion")[] {
  const out: (PermisoBool | "ubicacion")[] = [];
  const n = app.necesita;
  if (p.ubicacion === "siempre" || (p.ubicacion === "uso" && n.ubicacion === "no")) out.push("ubicacion");
  for (const k of PERMISOS_BOOL) if (p[k] && !n[k]) out.push(k);
  return out;
}

export type Destino = "empresa" | "anunciantes" | "corredor";
export const DESTINO_DEF: Record<Destino, { etq: string; icono: string; color: string; explica: string }> = {
  empresa: { etq: "Servidores de la empresa", icono: "fa-server", color: "#38bdf8", explica: "La empresa dueña de la app guarda lo que haces en ella." },
  anunciantes: { etq: "Red de anunciantes", icono: "fa-bullhorn", color: "#f472b6", explica: "Subastan tu atención: cada anuncio que ves se vende a quien pague por tu perfil." },
  corredor: { etq: "Corredor de datos", icono: "fa-database", color: "#fb923c", explica: "Empresas que compran, combinan y revenden perfiles de muchas fuentes." },
};

export type TipoDato = "ubicacion" | "contactos" | "fotos" | "microfono" | "rastreo" | "atencion";
export const TIPO_DATO_COLOR: Record<TipoDato, string> = {
  ubicacion: "#f87171",
  contactos: "#fbbf24",
  fotos: "#34d399",
  microfono: "#60a5fa",
  rastreo: "#f472b6",
  atencion: "#e2e8f0",
};

export interface FlujoApp {
  app: AppId;
  /** Paquetes de datos que salen en el día, por tipo. */
  porTipo: Record<TipoDato, number>;
  porDestino: Record<Destino, number>;
  total: number;
}

/**
 * Paquetes de datos de un día (MODELO ILUSTRATIVO):
 *  - ubicación «siempre»: un registro cada 15 min durante 24 h (96);
 *    «solo al usarla»: uno cada 5 min de uso.
 *  - contactos: una copia de la agenda; fotos: una lectura de la galería con
 *    sus metadatos (fecha y lugar); micrófono: acceso en 2 momentos.
 *  - atención (siempre, no hay permiso para apagarla): una señal por minuto de
 *    uso (qué viste, cuánto, qué saltaste).
 *  - rastreo entre apps: un identificador compartido por cada anuncio (uno cada 3 min).
 * Destinos: todo llega a la empresa; si vive de anuncios, la atención y el
 * rastreo llegan a la red de anunciantes; con rastreo activado, la ubicación
 * también llega a corredores de datos.
 */
export function flujoApp(app: AppDef, p: Permisos): FlujoApp {
  const porTipo: Record<TipoDato, number> = { ubicacion: 0, contactos: 0, fotos: 0, microfono: 0, rastreo: 0, atencion: 0 };
  porTipo.ubicacion = p.ubicacion === "siempre" ? 96 : p.ubicacion === "uso" ? Math.round(app.minutos / 5) : 0;
  porTipo.contactos = p.contactos ? 1 : 0;
  porTipo.fotos = p.fotos ? 1 : 0;
  porTipo.microfono = p.microfono ? 2 : 0;
  porTipo.atencion = app.minutos;
  porTipo.rastreo = p.rastreo && app.anuncios ? Math.round(app.minutos / 3) : 0;
  const total = Object.values(porTipo).reduce((a, b) => a + b, 0);
  const porDestino: Record<Destino, number> = { empresa: total, anunciantes: 0, corredor: 0 };
  if (app.anuncios) porDestino.anunciantes = porTipo.atencion + porTipo.rastreo;
  if (p.rastreo && app.anuncios) porDestino.corredor = porTipo.ubicacion + porTipo.rastreo;
  return { app: app.id, porTipo, porDestino, total };
}

export interface ResumenDia {
  flujos: FlujoApp[];
  total: number;
  porDestino: Record<Destino, number>;
  /** Porcentaje de los paquetes que llegan a empresas con sede fuera de México. */
  extranjero: number;
  inferencias: InferenciaId[];
  appsRotas: AppId[];
  sobrantes: number;
}

export type InferenciaId = "casa" | "relaciones" | "intereses" | "seguimiento" | "lugaresFotos";
export const INFERENCIA_DEF: Record<InferenciaId, { etq: string; icono: string; explica: string }> = {
  casa: {
    etq: "Dónde vives y dónde estudias",
    icono: "fa-house-chimney",
    explica: "Donde pasa tu celular la noche es tu casa y donde pasa las mañanas, tu escuela. Un estudio con 1.5 millones de personas encontró que 4 puntos de lugar y hora bastan para identificar al 95 % (de Montjoye y colaboradores, Scientific Reports, 2013).",
  },
  relaciones: { etq: "Con quién te relacionas", icono: "fa-user-group", explica: "Tu agenda y la de tus amistades dibujan tu red social, aunque tú no publiques nada." },
  intereses: {
    etq: "Qué te interesa y qué te engancha",
    icono: "fa-heart-pulse",
    explica: "Cuánto miras cada video y qué saltas no se apaga con ningún permiso: es la materia prima de la mercantilización de la atención.",
  },
  seguimiento: { etq: "Anunciantes que te siguen de app en app", icono: "fa-crosshairs", explica: "Con el rastreo activado, un mismo identificador une lo que haces en varias apps en un solo perfil." },
  lugaresFotos: { etq: "Dónde y cuándo tomaste tus fotos", icono: "fa-camera", explica: "Muchas fotos guardan en sus metadatos la fecha y las coordenadas donde se tomaron." },
};

export function resumenDia(perm: Record<AppId, Permisos>): ResumenDia {
  const flujos = APPS_ORDEN.map((id) => flujoApp(APPS[id], perm[id]));
  const total = flujos.reduce((a, f) => a + f.total, 0);
  const porDestino: Record<Destino, number> = { empresa: 0, anunciantes: 0, corredor: 0 };
  let ext = 0;
  for (const f of flujos) {
    (Object.keys(porDestino) as Destino[]).forEach((d) => (porDestino[d] += f.porDestino[d]));
    if (APPS[f.app].sede !== "México") ext += f.total;
  }
  const inf: InferenciaId[] = [];
  if (APPS_ORDEN.some((id) => perm[id].ubicacion === "siempre")) inf.push("casa");
  if (APPS_ORDEN.some((id) => perm[id].contactos)) inf.push("relaciones");
  inf.push("intereses");
  if (APPS_ORDEN.filter((id) => perm[id].rastreo && APPS[id].anuncios).length >= 2) inf.push("seguimiento");
  if (APPS_ORDEN.some((id) => perm[id].fotos)) inf.push("lugaresFotos");
  return {
    flujos,
    total,
    porDestino,
    extranjero: total > 0 ? (ext / total) * 100 : 0,
    inferencias: inf,
    appsRotas: APPS_ORDEN.filter((id) => !funciona(APPS[id], perm[id]).ok),
    sobrantes: APPS_ORDEN.reduce((a, id) => a + sobrantes(APPS[id], perm[id]).length, 0),
  };
}

/** Momentos del día modelo (hora y app que usas). */
export const MOMENTOS: { hora: number; app: AppId; txt: string }[] = [
  { hora: 7.5, app: "mapas", txt: "07:30 · el camión a la escuela" },
  { hora: 11, app: "mensajes", txt: "11:00 · recreo con tu grupo" },
  { hora: 14.5, app: "videos", txt: "14:30 · videos en la comida" },
  { hora: 17, app: "tienda", txt: "17:00 · compras un regalo" },
  { hora: 19.5, app: "mensajes", txt: "19:30 · notas de voz" },
  { hora: 21, app: "videos", txt: "21:00 · más videos" },
  { hora: 22.5, app: "juego", txt: "22:30 · un juego antes de dormir" },
];
/** Duración de la animación de un día (ms). */
export const T_DIA = 12000;

export interface EventoDato {
  /** Hora del día (0–24). */
  h: number;
  tipo: TipoDato;
  destino: Destino;
  app: AppId;
}

/**
 * Lista ordenada de los envíos de datos del día modelo, coherente con
 * `flujoApp`: los datos de uso se reparten en las sesiones de cada app y la
 * ubicación «siempre» cada 15 minutos durante las 24 horas. Determinista.
 */
export function eventosDia(perm: Record<AppId, Permisos>): EventoDato[] {
  const out: EventoDato[] = [];
  APPS_ORDEN.forEach((id, k) => {
    const app = APPS[id];
    const p = perm[id];
    const f = flujoApp(app, p);
    const sesiones = MOMENTOS.filter((m) => m.app === id);
    const durH = app.minutos / 60 / Math.max(1, sesiones.length);
    const enUso = (n: number, i: number) => {
      const s = sesiones[i % sesiones.length]!;
      const porSesion = Math.ceil(n / sesiones.length);
      return s.hora + (((i - (i % sesiones.length)) / sesiones.length + 0.5) / porSesion) * durH;
    };
    (Object.keys(f.porTipo) as TipoDato[]).forEach((tipo) => {
      const n = f.porTipo[tipo];
      for (let i = 0; i < n; i++) {
        const h = tipo === "ubicacion" && p.ubicacion === "siempre" ? ((i + 0.2 * k) / n) * 24 : enUso(n, i);
        out.push({ h, tipo, destino: "empresa", app: id });
        if (app.anuncios && (tipo === "atencion" || tipo === "rastreo")) out.push({ h, tipo, destino: "anunciantes", app: id });
        if (p.rastreo && app.anuncios && (tipo === "ubicacion" || tipo === "rastreo")) out.push({ h, tipo, destino: "corredor", app: id });
      }
    });
  });
  return out.sort((a, b) => a.h - b.h);
}

export function momentoEnHora(h: number) {
  let actual = MOMENTOS[0]!;
  for (const m of MOMENTOS) if (h >= m.hora) actual = m;
  return h < MOMENTOS[0]!.hora ? null : actual;
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. BRECHA DIGITAL — un trámite solo en línea
 * ════════════════════════════════════════════════════════════════════════ */

export type GrupoId = "urbano" | "rural" | "mayores" | "mayores75";
export const GRUPOS_ORDEN: GrupoId[] = ["urbano", "rural", "mayores", "mayores75"];

export interface Grupo {
  id: GrupoId;
  etq: string;
  icono: string;
  /** Usuarias de internet (ENDUTIH 2025, INEGI) — dato real. */
  acceso: number;
  /** Tienen a mano una computadora para un formulario de escritorio (ilustrativo). */
  compu: number;
  /** Pueden completar solas un formulario largo con archivos (ilustrativo). */
  habilidad: number;
  /** Logran enviarlo en un plazo de 5 días con su conexión (ilustrativo). */
  plazo: number;
  /** Fracción de quienes quedan fuera que acude a una ventanilla (ilustrativo: distancia, movilidad). */
  ventanilla: number;
  /** Fracción de no usuarios a quienes un punto de wifi gratuito resuelve el acceso (ilustrativo). */
  wifi: number;
}

export const GRUPOS: Record<GrupoId, Grupo> = {
  urbano: { id: "urbano", etq: "Ámbito urbano", icono: "fa-city", acceso: 0.889, compu: 0.55, habilidad: 0.88, plazo: 0.93, ventanilla: 0.85, wifi: 0.3 },
  rural: { id: "rural", etq: "Ámbito rural", icono: "fa-wheat-awn", acceso: 0.752, compu: 0.25, habilidad: 0.8, plazo: 0.8, ventanilla: 0.62, wifi: 0.45 },
  mayores: { id: "mayores", etq: "De 65 a 74 años", icono: "fa-person-cane", acceso: 0.578, compu: 0.45, habilidad: 0.55, plazo: 0.9, ventanilla: 0.8, wifi: 0.15 },
  mayores75: { id: "mayores75", etq: "De 75 años y más", icono: "fa-wheelchair", acceso: 0.303, compu: 0.4, habilidad: 0.4, plazo: 0.9, ventanilla: 0.7, wifi: 0.08 },
};

export type Politica = "celular" | "wifi" | "promotores" | "ventanilla" | "plazo";
export const POLITICAS_ORDEN: Politica[] = ["celular", "wifi", "promotores", "ventanilla", "plazo"];
export const MAX_POLITICAS = 3;

export const POLITICA_DEF: Record<Politica, { etq: string; icono: string; explica: string }> = {
  celular: {
    etq: "Formulario que funciona en celular",
    icono: "fa-mobile-screen",
    explica: "Quita el requisito de computadora. En 2025, 97.3 % de quienes usan internet se conectó con un celular inteligente y solo 36.2 % con computadora (ENDUTIH 2025).",
  },
  wifi: { etq: "Wifi gratuito en plazas y bibliotecas", icono: "fa-wifi", explica: "Da conexión a quien no la tiene en casa. Ayuda poco a quien no sabe usar internet." },
  promotores: {
    etq: "Promotores que acompañan el registro",
    icono: "fa-handshake-angle",
    explica: "La principal razón para no usar internet es no saber usarlo: 9.5 % de la población, más de la mitad de quienes no lo usaron (ENDUTIH 2024).",
  },
  ventanilla: { etq: "Ventanilla presencial o por teléfono", icono: "fa-building-columns", explica: "Una alternativa no digital: quien no puede en línea no pierde el derecho. Depende de la distancia y la movilidad." },
  plazo: { etq: "Plazo de 30 días en vez de 5", icono: "fa-calendar-days", explica: "Da tiempo a conseguir un equipo prestado o esperar una buena conexión." },
};

export type Barrera = "completa" | "sinInternet" | "sinEquipo" | "sinAyuda" | "plazo";
export const BARRERA_DEF: Record<Barrera, { etq: string; color: string; icono: string }> = {
  completa: { etq: "Completó el trámite", color: "#34d399", icono: "fa-circle-check" },
  sinInternet: { etq: "No usa internet", color: "#f87171", icono: "fa-wifi" },
  sinEquipo: { etq: "Sin computadora", color: "#fb923c", icono: "fa-laptop" },
  sinAyuda: { etq: "No pudo sin ayuda", color: "#c084fc", icono: "fa-circle-question" },
  plazo: { etq: "No alcanzó el plazo", color: "#94a3b8", icono: "fa-hourglass-end" },
};
export const BARRERAS: Barrera[] = ["completa", "sinInternet", "sinEquipo", "sinAyuda", "plazo"];

/** Fracción de no usuarios que dice no saber usar internet (9.5 de 16.9 %, ENDUTIH 2024). */
export const NO_SABE = 9.5 / 16.9;

export interface ResultadoGrupo {
  grupo: GrupoId;
  completa: number;
  barreras: Record<Barrera, number>;
}

export function resultadoGrupo(g: Grupo, pol: Politica[]): ResultadoGrupo {
  const tiene = (p: Politica) => pol.includes(p);
  let a = g.acceso;
  if (tiene("wifi")) a += (1 - a) * g.wifi;
  if (tiene("promotores")) a += (1 - a) * NO_SABE * 0.5;
  let d = g.compu;
  if (tiene("plazo")) d += (1 - d) * 0.25;
  if (tiene("celular")) d = Math.max(d, 0.973);
  const s = tiene("promotores") ? g.habilidad + (1 - g.habilidad) * 0.75 : g.habilidad;
  const t = tiene("plazo") ? 0.99 : g.plazo;
  const sinInternet = 1 - a;
  const sinEquipo = a * (1 - d);
  const sinAyuda = a * d * (1 - s);
  const plazo = a * d * s * (1 - t);
  const enLinea = a * d * s * t;
  const v = tiene("ventanilla") ? g.ventanilla : 0;
  const completa = enLinea + (1 - enLinea) * v;
  const k = 1 - v;
  return { grupo: g.id, completa, barreras: { completa, sinInternet: sinInternet * k, sinEquipo: sinEquipo * k, sinAyuda: sinAyuda * k, plazo: plazo * k } };
}

export function resultados(pol: Politica[]): ResultadoGrupo[] {
  return GRUPOS_ORDEN.map((id) => resultadoGrupo(GRUPOS[id], pol));
}

export const META_BRECHA = 0.75;

/** Reparte N personas por barrera con el método del mayor residuo (suma exacta N). */
export function repartir(r: ResultadoGrupo, n: number): Barrera[] {
  const brutos = BARRERAS.map((b) => ({ b, x: r.barreras[b] * n }));
  const base = brutos.map((o) => ({ ...o, e: Math.floor(o.x), res: o.x - Math.floor(o.x) }));
  let faltan = n - base.reduce((s, o) => s + o.e, 0);
  [...base].sort((p, q) => q.res - p.res).forEach((o) => {
    if (faltan > 0) {
      o.e += 1;
      faltan -= 1;
    }
  });
  const out: Barrera[] = [];
  for (const b of BARRERAS) out.push(...Array.from({ length: base.find((o) => o.b === b)!.e }, () => b));
  return out;
}

export const PERSONAS_POR_GRUPO = 20;

/* ════════════════════════════════════════════════════════════════════════
 * Estrellas: ¿qué concepto es? (inspirada en A9 relacionar columnas)
 * ════════════════════════════════════════════════════════════════════════ */

export type Concepto = "colonialismo" | "atencion" | "dependencia" | "brecha";
export const CONCEPTOS: Concepto[] = ["colonialismo", "atencion", "dependencia", "brecha"];
export const CONCEPTO_ETQ: Record<Concepto, string> = {
  colonialismo: "Colonialismo de datos",
  atencion: "Mercantilización de la atención",
  dependencia: "Dependencia tecnológica",
  brecha: "Brecha digital",
};

export const SITUACIONES: { texto: string; concepto: Concepto; porque: string }[] = [
  { texto: "Los datos de millones de mexicanos se procesan en servidores de empresas extranjeras, bajo leyes de otros países.", concepto: "colonialismo", porque: "Pocas corporaciones extranjeras extraen y controlan la información de las personas." },
  { texto: "Una app de videos reproduce el siguiente video sola para que no dejes de mirar y vea más anuncios.", concepto: "atencion", porque: "Tu tiempo mirando es el producto que se vende a los anunciantes." },
  { texto: "Toda la información de una escuela vive en la nube de un solo proveedor y, si cambia sus precios, no hay a dónde migrar.", concepto: "dependencia", porque: "Depender de una empresa que no controlas deja a la comunidad sin alternativa." },
  { texto: "En una localidad rural, la inscripción a un apoyo es solo en línea y muchas familias no tienen conexión en casa.", concepto: "brecha", porque: "Es una desigualdad de acceso por motivos regionales y socioeconómicos." },
  { texto: "Una plataforma arma perfiles con tus búsquedas, compras y horarios y los ofrece a anunciantes de otros países.", concepto: "colonialismo", porque: "La información sobre las personas se extrae como un recurso y la aprovechan otros." },
  { texto: "Las notificaciones de una red social están diseñadas para que abras la app muchas veces al día.", concepto: "atencion", porque: "Retener tu atención es el modelo de negocio." },
  { texto: "Un municipio no puede cobrar el predial porque el sistema de un proveedor extranjero dejó de funcionar.", concepto: "dependencia", porque: "Un servicio público quedó atado a una tecnología que la comunidad no controla." },
  { texto: "Una señora de 78 años no puede renovar un trámite porque la página exige subir documentos desde una computadora.", concepto: "brecha", porque: "Hay desigualdad en el uso de las tecnologías por edad y por equipo disponible." },
  { texto: "La mayoría de los sistemas de inteligencia artificial que usa México se entrenan en inglés y desde otros países.", concepto: "colonialismo", porque: "México consume lo que otros producen: una relación de poder desigual sobre los datos y el conocimiento." },
  { texto: "Un juego gratis te regala vidas extra a cambio de mirar un anuncio de 30 segundos.", concepto: "atencion", porque: "Pagas con tiempo y atención que se venden." },
  { texto: "Un país depende de cables, satélites y nubes de empresas extranjeras para que funcionen sus bancos.", concepto: "dependencia", porque: "Depende de infraestructura y empresas que no controla." },
  { texto: "En una comunidad, las mujeres usan menos el celular de la familia porque se le da prioridad a los hombres.", concepto: "brecha", porque: "Es una brecha digital de género." },
];

export function rondaSituaciones(rnd: () => number, n = 6): number[] {
  const idx = SITUACIONES.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j]!, idx[i]!];
  }
  return idx.slice(0, n);
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "¿Quién controla la información en internet?";

/** Lectura A1 — tres párrafos, verbatim. */
export const LECTURA_A1: string[] = [
  "Cada vez que usas una aplicación gratuita, estás pagando con algo más valioso que el dinero: tus datos. Las grandes plataformas digitales (Google, Meta, Amazon, TikTok) recolectan enormes cantidades de información sobre sus usuarios: qué buscas, cuánto tiempo pasas viendo cada contenido, qué compras, a qué horas te conectas, con quién hablas, qué emociones expresas. Con estos datos construyen perfiles detallados que venden a anunciantes o usan para influir en tu comportamiento.",
  "Esta dinámica tiene una dimensión geopolítica importante: la mayoría de las plataformas que dominan internet son de Estados Unidos o China, no de México ni de América Latina. Esto significa que los datos de millones de mexicanos son procesados, almacenados y controlados por empresas extranjeras bajo leyes de otros países. Algunos académicos llaman a esto \"colonialismo de datos\": una forma contemporánea de extracción de recursos, donde el recurso extraído es la información sobre las personas.",
  "Esta asimetría también se refleja en quién produce el conocimiento digital y quién lo consume: la mayoría de los contenidos, algoritmos y sistemas de inteligencia artificial son creados en inglés y desde perspectivas de países del Norte Global. Los usuarios de países como México son principalmente consumidores, no productores, del ecosistema digital global.",
];

/** Recuadro de la lectura A1 — verbatim. */
export const RECUADRO_A1 =
  "El marco de Competencias Digitales definido por la UNESCO organiza las habilidades digitales en cinco áreas: alfabetización en información y datos, comunicación y colaboración, creación de contenidos digitales, seguridad y resolución de problemas. México las integra en el currículo del NEM desde 2023.";

/** Precisión (no verbatim) sobre el recuadro. */
export const NOTA_RECUADRO =
  "Precisión: esas cinco áreas son las del marco europeo DigComp; el Marco Global de Alfabetización Digital de la UNESCO (2018) parte de ellas y agrega dos áreas más.";

export const PREGUNTAS: string[] = [
  "¿Qué tipo de datos recolectan las plataformas digitales según el texto?",
  "¿Qué es el 'colonialismo de datos' según el texto?",
  "¿Qué asimetría existe entre México y los países del Norte Global en el ecosistema digital?",
];

/** Reflexión A3 «Mis datos: ¿quién los tiene?» — verbatim. */
export const REFLEXION_A3 = {
  prompt:
    "Piensa en las plataformas digitales que más usas. ¿De qué país son? ¿Qué datos crees que tienen sobre ti? ¿Cómo crees que los usan? ¿Te parece justo el intercambio 'datos por servicio gratuito'? ¿Qué harías diferente si tuvieras más control sobre tus datos?",
  pistas: [
    "¿TikTok, Google, WhatsApp y YouTube son de qué países?",
    "¿Qué permisos les has dado (cámara, micrófono, ubicación, contactos)?",
    "¿Existe alguna plataforma mexicana o latinoamericana que uses?",
  ],
};

/** Pregunta final de la autoevaluación A7 — verbatim. */
export const REFLEXION_A7 = "¿Qué podrías hacer para reducir el impacto de la mercantilización de tu atención?";

/** Hechos: quiz A4 (verdadero/falso), cada enunciado con su retroalimentación. */
export const HECHOS: string[] = [
  "Verdadero: «El 'colonialismo de datos' describe cómo grandes corporaciones extraen y controlan los datos de millones de personas». Correcto: concentra poder e información en pocas empresas.",
  "Verdadero: «La 'mercantilización de la atención' significa que tu tiempo y atención se convierten en un producto que se vende». Correcto: muchas plataformas viven de retener tu atención.",
  "Falso: «Todas las personas del mundo tienen el mismo acceso a las tecnologías digitales». Existe desigualdad de acceso (socioeconómica, regional y de género).",
  "Verdadero: «La dependencia tecnológica puede afectar la autonomía de personas y comunidades». Correcto: depender de pocas empresas o servicios tiene riesgos.",
];

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Colonialismo de datos", definicion: "Apropiación y control de los datos de las personas por grandes corporaciones, generando relaciones de poder desiguales.", ejemplo: "Empresas que reúnen datos de usuarios de todo el mundo." },
  { termino: "Mercantilización de la atención", definicion: "Convertir la atención y el tiempo de las personas usuarias en un producto que se vende a anunciantes.", ejemplo: "Apps diseñadas para que pases más tiempo en ellas." },
  { termino: "Dependencia tecnológica", definicion: "Situación en que personas o países dependen de tecnologías o empresas que no controlan.", ejemplo: "Depender de un solo proveedor de servicios en la nube." },
  { termino: "Brecha digital", definicion: "Desigualdad en el acceso y uso de las tecnologías digitales por motivos socioeconómicos, regionales o de género.", ejemplo: "Comunidades sin internet de calidad." },
];

export const ACTIVIDAD_A5 = "Identifica un ejemplo de brecha digital en tu comunidad o escuela.";

export const FUENTE =
  "CEN Bachillerato — CD-I, progresión 3: lectura A1 (Material elaborado para CEN Bachillerato), quiz A2, reflexión A3, quiz A4, glosario A5, actividad A6 y autoevaluación A7.";

export const PROBLEMA =
  "La nube no está en el cielo: son edificios que beben agua y electricidad en Querétaro, apps que convierten tu día en datos y trámites que ya solo existen en línea. En este laboratorio decides cómo se enfría un centro de datos, qué permisos das a tus apps y qué política pública evita que una comunidad quede fuera.";

export const INSTRUCCIONES: string[] = [
  "En Dentro de la nube, elige un sistema de enfriamiento, mueve la temperatura exterior y la del pasillo frío, y compara el PUE contra el agua que se gasta en un año.",
  "En Tu huella de datos, decide los permisos de cada app y vive un día: mira qué datos salen, a quién llegan y qué pueden saber de ti.",
  "En Brecha digital, predice qué grupo queda más fuera de un trámite solo en línea y diseña hasta tres medidas para que todos lleguen a la meta.",
  "Relaciona situaciones con conceptos para ganar estrellas y resuelve el quiz A2 y el texto A6.",
];

export const IDEAS: string[] = [
  "La nube son edificios: consumen electricidad y, según cómo se enfríen, mucha agua en la comunidad donde están.",
  "Ahorrar agua puede costar electricidad y viceversa: no hay enfriamiento gratis, hay decisiones y políticas.",
  "Las apps «gratuitas» se pagan con datos; tu atención se registra aunque apagues todos los permisos.",
  "Dar solo los permisos que una app necesita (mínimo privilegio) reduce lo que se puede saber de ti.",
  "Casi 9 de cada 10 personas en México usan internet, pero la brecha por edad y entre el campo y la ciudad sigue siendo grande.",
  "Un servicio solo en línea traslada la brecha digital a la pérdida de derechos; las alternativas presenciales y el acompañamiento la reducen.",
];

/** Quiz A2 «Datos, poder y colonialismo digital» — verbatim. */
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Datos, poder y colonialismo digital",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Qué tipo de datos recopilan las plataformas digitales de sus usuarios?",
      opciones: ["Solo el nombre y correo electrónico", "Solo los datos que el usuario ingresa manualmente", "Comportamiento, preferencias, emociones, horarios, contactos y más", "Solo la ubicación geográfica"],
      respuestaCorrecta: 2,
      retroalimentacion: "Las plataformas recopilan datos masivos sobre comportamiento, emociones, horarios y mucho más.",
    },
    {
      enunciado: "¿Qué significa que las apps 'gratuitas' en realidad se pagan con datos?",
      opciones: ["Que hay un cargo oculto en la factura telefónica", "Que la información personal del usuario es el producto que se vende a anunciantes", "Que debes compartir la app con amigos para usarla gratis", "Que tienes que ver anuncios sin saltarlos"],
      respuestaCorrecta: 1,
      retroalimentacion: "El modelo de negocio de muchas apps gratuitas es vender datos de usuarios a anunciantes.",
    },
    {
      enunciado: "¿Qué es el 'colonialismo de datos' según el tema estudiado?",
      opciones: ["Una forma de piratería de software", "La extracción de datos de usuarios de países en desarrollo por plataformas de países del Norte Global", "El robo de contraseñas", "La exportación ilegal de computadoras"],
      respuestaCorrecta: 1,
      retroalimentacion: "El colonialismo de datos es la extracción de información de millones de personas de países como México por plataformas extranjeras.",
    },
    {
      enunciado: "¿Cuál es la asimetría digital que menciona el tema?",
      opciones: ["Que los hombres usan más internet que las mujeres", "Que los países del Norte Global producen el conocimiento digital y los del Sur lo consumen", "Que internet es más rápido en ciudades que en el campo", "Que los jóvenes usan más redes sociales que los adultos"],
      respuestaCorrecta: 1,
      retroalimentacion: "La asimetría es que países como EE.UU. y China producen algoritmos, IA y sistemas; México principalmente los consume.",
    },
    {
      enunciado: "¿Cuál de estas acciones ayuda a proteger tu privacidad de datos?",
      opciones: ["Tener muchos seguidores en redes sociales", "Leer los términos de privacidad y ajustar los permisos de las apps", "Usar solo apps de empresas grandes y conocidas", "Publicar mucha información personal para ganar popularidad"],
      respuestaCorrecta: 1,
      retroalimentacion: "Revisar y ajustar los permisos de privacidad en apps es una acción concreta de protección de datos.",
    },
  ],
};

/** Actividad A6 «Completa: impacto de las tecnologías» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "CD-I-P03-A6 · Completa: impacto de las tecnologías",
  instrucciones: "Completa con la palabra correcta.",
  partes: [
    "El ",
    " de datos describe cómo pocas corporaciones controlan la información de millones de personas. Cuando tu atención se vuelve un producto, hablamos de ",
    " de la atención. La desigualdad en el acceso a la tecnología se llama brecha ",
    ", y puede ser socioeconómica, regional o de ",
    ".",
  ],
  huecos: [
    { respuesta: "colonialismo", alternativas: [], pista: "Control de los datos por pocas empresas." },
    { respuesta: "mercantilización", alternativas: ["mercantilizacion"], pista: "Convertir en mercancía." },
    { respuesta: "digital", alternativas: [], pista: "Brecha ___." },
    { respuesta: "género", alternativas: ["genero"], pista: "Diferencia entre hombres y mujeres." },
  ],
};
