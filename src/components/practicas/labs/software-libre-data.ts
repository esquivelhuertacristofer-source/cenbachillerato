/**
 * Datos y modelo del laboratorio "Software libre y alternativas" (CD-I-P09,
 * progresión 4 de Cultura Digital I).
 *
 * Propósito de la progresión: «Utiliza herramientas de software libre y
 * experimenta con alternativas a los programas de patente y del software como
 * servicio.»
 *
 * Anclas:
 *   - A1 lectura «Las cuatro libertades del software libre»: marco teórico
 *     verbatim (3 párrafos + preguntas de comprensión).
 *   - A2 quiz «Software libre — Opción múltiple»: reto evaluable.
 *   - A6 completa el texto «las libertades del software».
 *   - A4 verdadero/falso: hechos. A5 glosario: 5 términos. A3 reflexión y
 *     A8 video (pregunta sobre el software como servicio): paneles.
 *
 * Lo que NO es verbatim:
 *   - Las licencias del modo 1 son reales (GNU GPL v3, MIT, Business Source
 *     License, contratos de uso privativos y términos de servicio) y los
 *     programas de ejemplo usan realmente esas licencias.
 *   - Los formatos del modo 2 y sus lectores son reales (estándares ISO/W3C,
 *     ingeniería inversa de libetonyek y libcdr, fin de Flash en 2020).
 *   - Los precios del modo 3 son precios de lista en dólares (EUA) con su año;
 *     el tipo de cambio y «un usuario por equipo» son simplificaciones
 *     ilustrativas. Muchas empresas dan licencias educativas gratuitas o con
 *     descuento.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "licencias" | "formatos" | "costos";
export const MODOS: Modo[] = ["licencias", "formatos", "costos"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  licencias: { etq: "La caja de las libertades", subtitulo: "¿Qué te deja hacer cada licencia?", icono: "fa-box-open", color: "#34d399" },
  formatos: { etq: "Cápsula del tiempo", subtitulo: "Un archivo de 2007 abierto hoy", icono: "fa-hourglass-half", color: "#38bdf8" },
  costos: { etq: "Equipa la sala", subtitulo: "Licencias, suscripciones y dependencia", icono: "fa-school", color: "#fbbf24" },
};

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
  const conMiles = ent!.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${x < 0 ? "−" : ""}${conMiles}${frac ? `.${frac}` : ""}`;
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. LA CAJA DE LAS LIBERTADES
 * ════════════════════════════════════════════════════════════════════════ */

/** Las cuatro libertades, numeradas 0 a 3 como en la lectura A1. */
export const LIBERTADES: { n: number; etq: string; corto: string; icono: string; color: string }[] = [
  { n: 0, etq: "Usar el programa para cualquier propósito", corto: "Usar", icono: "fa-play", color: "#34d399" },
  { n: 1, etq: "Estudiar cómo funciona y adaptarlo", corto: "Estudiar", icono: "fa-magnifying-glass", color: "#38bdf8" },
  { n: 2, etq: "Distribuir copias para ayudar a otras personas", corto: "Distribuir", icono: "fa-copy", color: "#a78bfa" },
  { n: 3, etq: "Mejorar el programa y publicar esas mejoras", corto: "Mejorar", icono: "fa-screwdriver-wrench", color: "#f472b6" },
];

export type LicenciaId = "gpl" | "mit" | "bsl" | "freeware" | "privativa" | "saas";
/** Qué recibe quien usa el programa: el código legible, solo el binario o nada (corre en otro servidor). */
export type Entrega = "fuente" | "binario" | "servidor";

export interface Licencia {
  id: LicenciaId;
  etq: string;
  tipo: string;
  ejemplo: string;
  precio: "gratis" | "de pago";
  precioDetalle: string;
  entrega: Entrega;
  /** Libertades 0–3 que concede. */
  libertades: [boolean, boolean, boolean, boolean];
  /** Por qué se abre o no cada puerta. */
  porque: [string, string, string, string];
  color: string;
  resumen: string;
  /** Solo en licencias que permiten modificar: qué pasa con una versión modificada que alguien distribuye. */
  derivada?: { libre: boolean; explica: string };
}

export const LICENCIAS: Licencia[] = [
  {
    id: "gpl",
    etq: "GNU GPL v3",
    tipo: "Libre con copyleft",
    ejemplo: "GIMP (editor de imágenes)",
    precio: "gratis",
    precioDetalle: "Se descarga gratis, aunque la GPL también permite vender copias.",
    entrega: "fuente",
    libertades: [true, true, true, true],
    porque: [
      "La GPL permite ejecutar el programa para cualquier propósito, también en una empresa.",
      "El código fuente se publica: puedes leerlo y cambiarlo.",
      "Puedes dar o vender copias a quien quieras.",
      "Puedes publicar tu versión mejorada, siempre con su código fuente.",
    ],
    color: "#34d399",
    resumen: "Las cuatro puertas abiertas: es software libre. Su condición (copyleft) es que las versiones modificadas que se distribuyan conserven esas mismas libertades.",
    derivada: { libre: true, explica: "Copyleft: quien distribuya una versión modificada debe hacerlo con la misma GPL y su código fuente. Las libertades pasan a cada nueva versión." },
  },
  {
    id: "mit",
    etq: "Licencia MIT",
    tipo: "Libre permisiva",
    ejemplo: "Godot (motor de videojuegos)",
    precio: "gratis",
    precioDetalle: "Gratis; la licencia no pone precio ni lo prohíbe.",
    entrega: "fuente",
    libertades: [true, true, true, true],
    porque: [
      "Permite usarlo para cualquier fin sin pedir permiso.",
      "El código está publicado y se puede modificar.",
      "Puedes copiarlo y repartirlo; solo hay que conservar el aviso de derechos de autor.",
      "Puedes publicar tu versión mejorada con la licencia que elijas.",
    ],
    color: "#2dd4bf",
    resumen: "Las cuatro puertas abiertas: también es software libre, pero permisivo. Solo pide conservar el aviso de derechos de autor.",
    derivada: { libre: false, explica: "Permisiva: una empresa puede tomar el código, modificarlo y distribuir su versión como programa privativo, sin publicar su código. El original sigue siendo libre." },
  },
  {
    id: "bsl",
    etq: "Business Source License",
    tipo: "Código visible, no libre",
    ejemplo: "Terraform (desde agosto de 2023)",
    precio: "gratis",
    precioDetalle: "Se descarga gratis y su código se puede leer.",
    entrega: "fuente",
    libertades: [false, true, true, true],
    porque: [
      "Restringe el uso en producción: no se puede usar para ofrecer un producto que compita con el de la empresa. No es «cualquier propósito».",
      "El código se publica y la licencia permite modificarlo.",
      "Permite copiar y redistribuir, con la misma licencia.",
      "Permite hacer versiones modificadas, con las mismas restricciones de uso.",
    ],
    color: "#fbbf24",
    resumen: "Ver el código no basta. Falla la libertad 0, así que NO es software libre (la OSI tampoco la reconoce como código abierto). En respuesta, la comunidad creó OpenTofu, una copia libre de la última versión que tenía licencia libre.",
  },
  {
    id: "freeware",
    etq: "Freeware",
    tipo: "Gratis, pero privativo",
    ejemplo: "Adobe Acrobat Reader",
    precio: "gratis",
    precioDetalle: "No cuesta nada instalarlo.",
    entrega: "binario",
    libertades: [true, false, false, false],
    porque: [
      "Puedes usarlo sin pagar en tus equipos.",
      "Solo recibes el programa ya compilado (binario); el contrato prohíbe descompilarlo.",
      "Para repartirlo en otros sitios o equipos de terceros se necesita un acuerdo de distribución con Adobe.",
      "Sin código ni permiso, nadie puede mejorarlo y publicar su versión.",
    ],
    color: "#fb923c",
    resumen: "Gratis no es libre: el precio es cero, pero tres de las cuatro puertas están cerradas.",
  },
  {
    id: "privativa",
    etq: "Licencia privativa (EULA)",
    tipo: "Privativo de pago",
    ejemplo: "Microsoft Office Hogar 2024",
    precio: "de pago",
    precioDetalle: "Pago único de US$149.99 (precio de lista en EUA) por un equipo.",
    entrega: "binario",
    libertades: [false, false, false, false],
    porque: [
      "Su licencia es solo para uso no comercial en un equipo: no es «cualquier propósito».",
      "Recibes el binario; el código fuente es secreto.",
      "Copiarlo para otra persona viola la licencia.",
      "Nadie fuera de la empresa puede modificarlo.",
    ],
    color: "#f87171",
    resumen: "Las cuatro puertas cerradas, aunque lo pagaste: compras permiso de uso con condiciones, no el programa.",
  },
  {
    id: "saas",
    etq: "Términos de servicio",
    tipo: "Software como servicio (SaaS)",
    ejemplo: "Google Docs",
    precio: "gratis",
    precioDetalle: "Gratis con una cuenta personal.",
    entrega: "servidor",
    libertades: [false, false, false, false],
    porque: [
      "No tienes una copia: lo usas mientras el proveedor lo ofrezca y según sus términos, que puede cambiar.",
      "El programa corre en los servidores del proveedor; no ves ni el código ni el binario.",
      "No hay nada que copiar: solo una página a la que accedes con tu cuenta.",
      "Solo el proveedor decide qué cambia y cuándo.",
    ],
    color: "#c084fc",
    resumen: "Las libertades no aplican porque el programa nunca está en tu equipo. Es gratis y cómodo, pero dependes por completo del proveedor.",
  },
];

export const ENTREGA_DEF: Record<Entrega, { etq: string; explica: string; icono: string }> = {
  fuente: { etq: "Código fuente legible", explica: "Recibes el texto que escribieron las personas programadoras: se puede leer y cambiar.", icono: "fa-code" },
  binario: { etq: "Solo el binario", explica: "Recibes ceros y unos que entiende la máquina, no las personas: se puede ejecutar, pero no estudiar ni adaptar.", icono: "fa-microchip" },
  servidor: { etq: "Nada: corre en un servidor ajeno", explica: "El programa vive en la computadora del proveedor; tú solo ves su resultado en el navegador.", icono: "fa-cloud" },
};

/** Una licencia es libre si concede las cuatro libertades. */
export const esLibre = (l: Licencia) => l.libertades.every(Boolean);

/** Fragmento de código fuente real de ejemplo (legible por personas). */
export const CODIGO_EJEMPLO: string[] = ["func _process(delta):", "    velocidad += gravedad * delta", "    if Input.is_action_pressed(\"saltar\"):", "        velocidad.y = -impulso", "    move_and_slide()"];

/* ════════════════════════════════════════════════════════════════════════
 * 2. CÁPSULA DEL TIEMPO: FORMATOS ABIERTOS Y CERRADOS
 * ════════════════════════════════════════════════════════════════════════ */

export const ANIO_GUARDADO = 2007;
export const ANIO_HOY = 2026;

/** De quién depende poder leer el archivo. */
export type Dependencia = "abierta" | "empresa" | "cerrada";
export const DEPENDENCIAS: { id: Dependencia; etq: string; explica: string; icono: string; color: string }[] = [
  { id: "abierta", etq: "De una especificación pública", explica: "Cualquiera puede leer la especificación y programar un lector sin pedir permiso.", icono: "fa-book-open", color: "#34d399" },
  { id: "empresa", etq: "De lo que decida una empresa", explica: "La empresa publica (o no) partes del formato y controla su programa y sus cambios.", icono: "fa-building", color: "#fbbf24" },
  { id: "cerrada", etq: "De un solo programa", explica: "No hay especificación pública: solo el programa original lo entiende del todo.", icono: "fa-lock", color: "#f87171" },
];

export type Resultado = "integro" | "cambios" | "perdidas" | "no";
export const RESULTADO_DEF: Record<Resultado, { etq: string; color: string }> = {
  integro: { etq: "Íntegro", color: "#34d399" },
  cambios: { etq: "Se abre con cambios de formato", color: "#a3e635" },
  perdidas: { etq: "Se abre con pérdidas", color: "#fbbf24" },
  no: { etq: "No lo abre", color: "#f87171" },
};

export interface Lector {
  programa: string;
  libre: boolean;
  resultado: Resultado;
  nota: string;
}

export type EntregableId = "tarea" | "foto" | "logo" | "animacion";
export const ENTREGABLES: { id: EntregableId; etq: string; icono: string }[] = [
  { id: "tarea", etq: "Tarea escrita", icono: "fa-file-lines" },
  { id: "foto", etq: "Foto editada con capas", icono: "fa-image" },
  { id: "logo", etq: "Logo de la escuela", icono: "fa-pen-nib" },
  { id: "animacion", etq: "Animación para la página web", icono: "fa-film" },
];

export type FormatoId = "odt" | "docx" | "pages" | "png" | "psd" | "svg" | "cdr" | "gif" | "swf";

export interface Formato {
  id: FormatoId;
  entregable: EntregableId;
  ext: string;
  nombre: string;
  /** Programa con el que se guardó en 2007. */
  original: string;
  dependencia: Dependencia;
  especificacion: string;
  /** Qué le pasó al programa original. */
  destinoOriginal: string;
  lectores: Lector[];
  /** Mejor resultado hoy sin el programa original (o sin pagarlo). */
  resultado: Resultado;
  explica: string;
  abierto: boolean;
  /** Se rescata gracias a software libre que descifró el formato por ingeniería inversa. */
  rescate?: boolean;
}

export const FORMATOS: Formato[] = [
  {
    id: "odt",
    entregable: "tarea",
    ext: ".odt",
    nombre: "OpenDocument Text",
    original: "OpenOffice.org Writer 2",
    dependencia: "abierta",
    especificacion: "Estándar OASIS (2005) e ISO/IEC 26300 (2006).",
    destinoOriginal: "Oracle abandonó OpenOffice.org en 2011 (continuó como Apache OpenOffice); el formato siguió vivo.",
    lectores: [
      { programa: "LibreOffice Writer", libre: true, resultado: "integro", nota: "Implementa el estándar completo." },
      { programa: "Microsoft Word", libre: false, resultado: "cambios", nota: "Lo abre; la maquetación puede variar." },
      { programa: "Google Docs", libre: false, resultado: "cambios", nota: "Lo importa y lo convierte." },
    ],
    resultado: "integro",
    explica: "El programa con que se guardó ya no existe, pero la especificación es pública: otros programas la implementan y la tarea se lee completa.",
    abierto: true,
  },
  {
    id: "docx",
    entregable: "tarea",
    ext: ".docx",
    nombre: "Office Open XML",
    original: "Microsoft Word 2007",
    dependencia: "abierta",
    especificacion: "Estándar Ecma-376 (2006) e ISO/IEC 29500 (2008), muy extenso.",
    destinoOriginal: "Word 2007 dejó de recibir soporte en 2017; la versión actual requiere licencia o suscripción.",
    lectores: [
      { programa: "LibreOffice Writer", libre: true, resultado: "cambios", nota: "Lo abre; en documentos complejos cambia algo de la maquetación." },
      { programa: "Google Docs", libre: false, resultado: "cambios", nota: "Lo importa con ajustes de formato." },
      { programa: "Word actual (pagando)", libre: false, resultado: "integro", nota: "Íntegro, pero hay que pagar." },
    ],
    resultado: "cambios",
    explica: "Es un estándar publicado, así que otros programas lo leen; pero es tan extenso que sin Word pueden cambiar detalles de la maquetación.",
    abierto: true,
  },
  {
    id: "pages",
    entregable: "tarea",
    ext: ".pages",
    nombre: "Documento de Pages '08",
    original: "Apple Pages '08",
    dependencia: "cerrada",
    especificacion: "Apple no publica la especificación.",
    destinoOriginal: "Pages '08 era de 32 bits y no corre desde macOS Catalina (2019); el Pages actual no abre documentos anteriores a Pages '09.",
    lectores: [
      { programa: "Pages actual", libre: false, resultado: "no", nota: "Rechaza documentos anteriores a Pages '09." },
      { programa: "LibreOffice (libetonyek)", libre: true, resultado: "perdidas", nota: "Lo importa gracias a ingeniería inversa; puede perder formato." },
      { programa: "Microsoft Word", libre: false, resultado: "no", nota: "No reconoce el formato." },
    ],
    resultado: "perdidas",
    explica: "Ni el fabricante lo abre ya. Lo rescata a medias LibreOffice, porque voluntarios descifraron el formato por ingeniería inversa (biblioteca libre libetonyek).",
    abierto: false,
    rescate: true,
  },
  {
    id: "png",
    entregable: "foto",
    ext: ".png",
    nombre: "Portable Network Graphics",
    original: "Adobe Photoshop CS3 (exportada)",
    dependencia: "abierta",
    especificacion: "Recomendación W3C (1996) e ISO/IEC 15948 (2004).",
    destinoOriginal: "No importa: el archivo no depende de Photoshop.",
    lectores: [
      { programa: "GIMP", libre: true, resultado: "integro", nota: "Imagen completa." },
      { programa: "Krita", libre: true, resultado: "integro", nota: "Imagen completa." },
      { programa: "Cualquier navegador", libre: false, resultado: "integro", nota: "Firefox, Chrome, Safari…" },
    ],
    resultado: "integro",
    explica: "Se abre igual en cualquier programa. Ojo: PNG guarda la imagen final, no las capas; para seguir editando conviene guardar aparte un archivo de trabajo.",
    abierto: true,
  },
  {
    id: "psd",
    entregable: "foto",
    ext: ".psd",
    nombre: "Documento de Photoshop",
    original: "Adobe Photoshop CS3",
    dependencia: "empresa",
    especificacion: "Adobe publica una descripción del formato, pero no es un estándar y la cambia con cada versión.",
    destinoOriginal: "Adobe dejó de vender licencias perpetuas en 2013: hoy Photoshop solo se obtiene por suscripción.",
    lectores: [
      { programa: "GIMP", libre: true, resultado: "perdidas", nota: "Abre las capas de píxeles; pierde capas de ajuste y algunos efectos." },
      { programa: "Krita", libre: true, resultado: "perdidas", nota: "Abre capas básicas; los efectos no siempre." },
      { programa: "Photoshop (suscripción)", libre: false, resultado: "integro", nota: "Íntegro, pagando cada mes." },
    ],
    resultado: "perdidas",
    explica: "Las capas sencillas se salvan, pero efectos y ajustes solo los entiende del todo Photoshop, que ahora es de suscripción.",
    abierto: false,
  },
  {
    id: "svg",
    entregable: "logo",
    ext: ".svg",
    nombre: "Scalable Vector Graphics",
    original: "Inkscape 0.45",
    dependencia: "abierta",
    especificacion: "Recomendación W3C (SVG 1.0, 2001).",
    destinoOriginal: "Inkscape sigue desarrollándose; y aunque no existiera, el formato es público.",
    lectores: [
      { programa: "Inkscape", libre: true, resultado: "integro", nota: "Vectores y texto completos." },
      { programa: "Cualquier navegador", libre: false, resultado: "integro", nota: "Se muestra sin instalar nada." },
      { programa: "Adobe Illustrator", libre: false, resultado: "integro", nota: "También lo lee." },
    ],
    resultado: "integro",
    explica: "El logo se abre completo en programas libres, privativos y hasta en el navegador: nadie es dueño del formato.",
    abierto: true,
  },
  {
    id: "cdr",
    entregable: "logo",
    ext: ".cdr",
    nombre: "Dibujo de CorelDRAW X3",
    original: "CorelDRAW X3",
    dependencia: "cerrada",
    especificacion: "Corel no publica la especificación.",
    destinoOriginal: "CorelDRAW X3 está descontinuado; la versión actual se paga.",
    lectores: [
      { programa: "Inkscape (libcdr)", libre: true, resultado: "perdidas", nota: "Formas, colores y texto sí; efectos complejos no." },
      { programa: "LibreOffice Draw (libcdr)", libre: true, resultado: "perdidas", nota: "Importa el dibujo básico." },
      { programa: "Navegador", libre: false, resultado: "no", nota: "No lo reconoce." },
    ],
    resultado: "perdidas",
    explica: "Sin CorelDRAW, lo rescata a medias software libre: la biblioteca libcdr descifró el formato (versiones 7 a X4) por ingeniería inversa.",
    abierto: false,
    rescate: true,
  },
  {
    id: "gif",
    entregable: "animacion",
    ext: ".gif",
    nombre: "GIF animado",
    original: "GIMP 2.4",
    dependencia: "abierta",
    especificacion: "Especificación pública GIF89a (1989); la patente de su compresión LZW venció entre 2003 y 2004.",
    destinoOriginal: "No importa: cualquier visor de imágenes lo reproduce.",
    lectores: [
      { programa: "Cualquier navegador", libre: false, resultado: "integro", nota: "Se reproduce sin complementos." },
      { programa: "GIMP", libre: true, resultado: "integro", nota: "Abre cada cuadro como capa." },
      { programa: "Visor de fotos del sistema", libre: false, resultado: "integro", nota: "Se reproduce." },
    ],
    resultado: "integro",
    explica: "Sencillo y público: casi 40 años después, cualquier dispositivo lo reproduce.",
    abierto: true,
  },
  {
    id: "swf",
    entregable: "animacion",
    ext: ".swf",
    nombre: "Animación Flash",
    original: "Adobe Flash CS3",
    dependencia: "empresa",
    especificacion: "Adobe liberó la especificación en 2008, pero controlaba el único reproductor completo.",
    destinoOriginal: "Adobe terminó el soporte de Flash Player el 31 de diciembre de 2020 y bloqueó su contenido desde el 12 de enero de 2021; los navegadores lo eliminaron.",
    lectores: [
      { programa: "Cualquier navegador", libre: false, resultado: "no", nota: "Ya no incluyen Flash." },
      { programa: "Flash Player", libre: false, resultado: "no", nota: "Bloqueado por Adobe desde 2021." },
      { programa: "Ruffle (emulador libre)", libre: true, resultado: "perdidas", nota: "Reproduce muchas animaciones; no todas las interactivas." },
    ],
    resultado: "perdidas",
    explica: "Millones de animaciones dependían de un solo reproductor. Cuando la empresa lo apagó, solo un emulador de software libre las rescata en parte.",
    abierto: false,
  },
];

export const formatosDe = (e: EntregableId) => FORMATOS.filter((f) => f.entregable === e);

/* ════════════════════════════════════════════════════════════════════════
 * 3. EQUIPA LA SALA DE CÓMPUTO
 * ════════════════════════════════════════════════════════════════════════ */

/** Tipo de cambio ILUSTRATIVO (pesos por dólar). */
export const TC_MXN = 18.5;
export const EQ_MIN = 10;
export const EQ_MAX = 40;
export const ANIOS_MAX = 6;

export type Ruta = "compra" | "suscripcion" | "libre";
export const RUTA_DEF: Record<Ruta, { etq: string; color: string; icono: string }> = {
  compra: { etq: "Licencia privativa (pago único)", color: "#60a5fa", icono: "fa-key" },
  suscripcion: { etq: "Suscripción (software como servicio)", color: "#fb923c", icono: "fa-arrows-rotate" },
  libre: { etq: "Software libre", color: "#34d399", icono: "fa-lock-open" },
};

export interface Opcion {
  ruta: Ruta;
  producto: string;
  /** US$ por equipo, una sola vez. */
  unico: number;
  /** US$ por usuario al mes. */
  mensual: number;
  precio: string;
  /** Qué pasa si se deja de pagar. */
  sinPago: string;
}

export type NecesidadId = "so" | "ofimatica" | "imagen";
export interface Necesidad {
  id: NecesidadId;
  etq: string;
  icono: string;
  opciones: Opcion[];
}

export const NECESIDADES: Necesidad[] = [
  {
    id: "so",
    etq: "Sistema operativo",
    icono: "fa-desktop",
    opciones: [
      { ruta: "compra", producto: "Windows 11 Pro", unico: 199.99, mensual: 0, precio: "US$199.99 por equipo (precio de lista, Microsoft Store EUA). Casi siempre viene incluido en el precio de la computadora.", sinPago: "Es pago único: sigue funcionando mientras Microsoft le dé soporte." },
      { ruta: "libre", producto: "Linux Mint (GNU/Linux)", unico: 0, mensual: 0, precio: "US$0 en licencias.", sinPago: "No hay nada que pagar: sigue funcionando y actualizándose." },
    ],
  },
  {
    id: "ofimatica",
    etq: "Ofimática",
    icono: "fa-file-word",
    opciones: [
      { ruta: "compra", producto: "Office Hogar y Empresas 2024", unico: 249.99, mensual: 0, precio: "US$249.99 por equipo, pago único (precio de lista EUA).", sinPago: "Sigue funcionando, pero sin versiones nuevas. Ojo: Office 2016 y 2019 dejaron de recibir soporte el 14 de octubre de 2025." },
      { ruta: "suscripcion", producto: "Microsoft 365 Empresa Estándar", unico: 0, mensual: 14, precio: "US$14 por usuario al mes con compromiso anual (precio de lista EUA desde el 1 de julio de 2026; antes US$12.50).", sinPago: "Las aplicaciones pasan a «funcionalidad reducida»: puedes abrir e imprimir tus documentos, pero no editarlos ni crear nuevos." },
      { ruta: "libre", producto: "LibreOffice", unico: 0, mensual: 0, precio: "US$0 en licencias.", sinPago: "No hay suscripción: sigue funcionando igual y guarda en formato abierto (ODF)." },
    ],
  },
  {
    id: "imagen",
    etq: "Edición de imagen",
    icono: "fa-image",
    opciones: [
      { ruta: "suscripcion", producto: "Adobe Photoshop", unico: 0, mensual: 22.99, precio: "US$22.99 al mes, plan individual anual (precio de lista EUA, 2025). Los planes para organizaciones cuestan más.", sinPago: "Pierdes acceso a la aplicación. Tus archivos .psd siguen en el disco, pero sin Photoshop se abren con pérdidas (mira la cápsula del tiempo)." },
      { ruta: "libre", producto: "GIMP", unico: 0, mensual: 0, precio: "US$0 en licencias.", sinPago: "No hay suscripción: sigue funcionando igual." },
    ],
  },
];

/** Costo en dólares de una opción para `equipos` equipos durante `anios` años (un usuario por equipo). */
export function costoUSD(o: Opcion, equipos: number, anios: number): number {
  return o.unico * equipos + o.mensual * 12 * anios * equipos;
}

/** Mes a partir del cual la suscripción cuesta más que la compra (por equipo). */
export function mesEquilibrio(unico: number, mensual: number): number {
  return Math.ceil(unico / mensual);
}

/** Valor «redondo» de cada moneda para que la pila más alta no pase de `maxMonedas`. */
export function valorMoneda(maxMXN: number, maxMonedas = 36): number {
  const pasos = [5000, 10000, 20000, 25000, 50000, 100000, 200000];
  return pasos.find((p) => maxMXN / p <= maxMonedas) ?? 500000;
}

/** Pregunta de predicción del modo 3 (se calcula con los datos de arriba). */
export const PRED_EQUIPOS = 30;
export const PRED_ANIOS = 5;
export type PrediccionCosto = "compra" | "suscripcion" | "igual";
export const PRED_OPCIONES: { id: PrediccionCosto; etq: string }[] = [
  { id: "compra", etq: "Comprar Office 2024 sale más caro" },
  { id: "suscripcion", etq: "Suscribirse a Microsoft 365 sale más caro" },
  { id: "igual", etq: "Cuestan casi lo mismo" },
];

/* ── Estrellas: ¿libre, gratis o de pago? ──────────────────────────────── */

export type Categoria = "libre" | "gratis" | "pago" | "saas";
export const CATEGORIAS: { id: Categoria; etq: string; icono: string; color: string }[] = [
  { id: "libre", etq: "Software libre", icono: "fa-lock-open", color: "#34d399" },
  { id: "gratis", etq: "Gratis, pero privativo", icono: "fa-gift", color: "#fb923c" },
  { id: "pago", etq: "Privativo de pago", icono: "fa-key", color: "#60a5fa" },
  { id: "saas", etq: "Servicio en línea (SaaS)", icono: "fa-cloud", color: "#c084fc" },
];

export const PROGRAMAS: { nombre: string; cat: Categoria; porque: string }[] = [
  { nombre: "GIMP", cat: "libre", porque: "Licencia GNU GPL v3: cuatro libertades." },
  { nombre: "Inkscape", cat: "libre", porque: "Licencia GNU GPL: puedes estudiarlo, copiarlo y mejorarlo." },
  { nombre: "Blender", cat: "libre", porque: "Licencia GNU GPL, aunque lo usan estudios profesionales." },
  { nombre: "LibreOffice", cat: "libre", porque: "Licencia MPL 2.0, reconocida como libre." },
  { nombre: "Firefox", cat: "libre", porque: "Licencia MPL 2.0: su código es público." },
  { nombre: "VLC", cat: "libre", porque: "Licencias GPL y LGPL." },
  { nombre: "Adobe Acrobat Reader", cat: "gratis", porque: "Cuesta cero, pero no hay código ni permiso para repartirlo o modificarlo." },
  { nombre: "Google Chrome", cat: "gratis", porque: "Se basa en Chromium, que sí es libre, pero Chrome agrega partes privativas." },
  { nombre: "WhatsApp", cat: "gratis", porque: "Gratis, con código cerrado." },
  { nombre: "Zoom (aplicación)", cat: "gratis", porque: "El plan básico es gratis, pero el programa es privativo." },
  { nombre: "Windows 11 Pro", cat: "pago", porque: "Licencia de pago y código secreto." },
  { nombre: "CorelDRAW Graphics Suite", cat: "pago", porque: "Se paga y su código es cerrado." },
  { nombre: "Microsoft Office Hogar 2024", cat: "pago", porque: "Pago único con licencia de uso no comercial." },
  { nombre: "Google Docs", cat: "saas", porque: "Corre en los servidores de Google: lo usas desde el navegador." },
  { nombre: "Canva (en el navegador)", cat: "saas", porque: "Tus diseños viven en la plataforma del proveedor." },
  { nombre: "Figma", cat: "saas", porque: "Se usa en línea con una cuenta; el programa corre en sus servidores." },
];

export function rondaProgramas(rnd: () => number, n = 8): number[] {
  const baraja = (xs: number[]) => {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  };
  const porCat = CATEGORIAS.map((c) => baraja(PROGRAMAS.map((p, i) => ({ p, i })).filter((x) => x.p.cat === c.id).map((x) => x.i)).slice(0, Math.floor(n / CATEGORIAS.length)));
  return baraja(porCat.flat());
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "Las cuatro libertades del software libre";

/** Lectura A1 — tres párrafos, verbatim. */
export const LECTURA_A1: string[] = [
  "El software libre es aquel que respeta la libertad de las personas usuarias. Se define por cuatro libertades: (0) usar el programa para cualquier propósito; (1) estudiar cómo funciona y adaptarlo, lo que requiere acceso al código fuente; (2) distribuir copias para ayudar a otras personas; y (3) mejorar el programa y publicar esas mejoras para que toda la comunidad se beneficie. Estas libertades nacieron del proyecto GNU, impulsado por Richard Stallman, que junto con el núcleo Linux dio origen al sistema operativo GNU/Linux, usado hoy en servidores, teléfonos y supercomputadoras.",
  "El software libre se relaciona con la cultura hacker en su sentido original: personas curiosas que exploran, comparten conocimiento y construyen herramientas con la filosofía del 'Hazlo tú mismx' (DIY). Conviene distinguir 'software libre' (que pone el acento en la libertad y la ética) de 'open source' o código abierto (que destaca las ventajas prácticas y de desarrollo); aunque suelen coincidir, su motivación es distinta.",
  "Gracias al software libre existen herramientas ofimáticas gratuitas y de calidad: procesadores de texto, hojas de cálculo y programas de presentaciones (por ejemplo, la suite LibreOffice), que permiten estudiar y trabajar sin depender de licencias privativas de pago.",
];

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS: string[] = ["¿Cuáles son las cuatro libertades del software libre?", "¿Qué diferencia hay entre 'software libre' y 'open source'?"];

/** Reflexión A3 — verbatim. */
export const REFLEXION_A3 = "¿Por qué crees que tener la libertad de usar, estudiar, compartir y mejorar un programa puede ser importante para los estudiantes y para tu comunidad? Da al menos un ejemplo concreto.";

/** Video A8: pregunta de opción múltiple sobre el software como servicio — verbatim. */
export const SAAS_A8 = {
  pregunta: "¿Qué es el software como servicio?",
  respuesta: "Un programa al que se accede mediante internet sin instalarlo por completo",
};

/** Hechos: quiz A4 (verdadero/falso), cada enunciado con su retroalimentación. */
export const HECHOS: string[] = [
  "Verdadero: «El software libre permite estudiar y modificar el programa». Correcto: es la libertad 1.",
  "Falso: «'Software libre' significa siempre que es gratis y nada más». Libre se refiere a libertad, no necesariamente a precio.",
  "Verdadero: «GNU/Linux es un ejemplo de sistema operativo libre». Correcto.",
  "Verdadero: «La cultura hacker, en su sentido original, se basa en explorar y compartir conocimiento». Correcto: la filosofía 'Hazlo tú mismx'.",
];

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Software libre", definicion: "Software que respeta las cuatro libertades: usar, estudiar, distribuir y mejorar.", ejemplo: "GNU/Linux, LibreOffice." },
  { termino: "Código fuente", definicion: "Instrucciones escritas por las personas programadoras que se necesitan para estudiar y modificar un programa.", ejemplo: "El texto del programa antes de convertirse en aplicación." },
  { termino: "GNU/Linux", definicion: "Sistema operativo libre formado por el proyecto GNU y el núcleo Linux.", ejemplo: "Distribuciones como Ubuntu o Debian." },
  { termino: "Open source", definicion: "Enfoque que destaca las ventajas prácticas del código abierto; suele coincidir con el software libre, pero con otra motivación.", ejemplo: "Proyectos colaborativos en línea." },
  { termino: "Suite ofimática", definicion: "Conjunto de programas de oficina: procesador de texto, hoja de cálculo y presentaciones.", ejemplo: "LibreOffice (Writer, Calc, Impress)." },
];

export const ACTIVIDAD_A5 = "Busca una distribución de GNU/Linux y anota para qué se usa.";

export const FUENTE =
  "CEN Bachillerato — Cultura Digital I, progresión 4 (CD-I-P09): lectura A1, quiz A2, reflexión A3, quiz A4, glosario A5, actividad A6 y video A8. Licencias: textos de la GNU GPL v3 (FSF), MIT (OSI), Business Source License 1.1 y contratos de uso de cada producto. Formatos: OASIS/ISO/IEC 26300, Ecma-376/ISO/IEC 29500, W3C PNG y SVG, GIF89a, anuncios de fin de Flash Player (Adobe), libetonyek y libcdr (The Document Foundation). Precios: páginas de compra de Microsoft y Adobe en EUA.";

export const PROBLEMA =
  "Tu escuela va a equipar la sala de cómputo. ¿Qué programas conviene instalar? No basta con mirar el precio: importa qué te deja hacer cada licencia, si podrás abrir tus archivos dentro de muchos años y qué pasa el día que dejes de pagar.";

export const INSTRUCCIONES: string[] = [
  "En La caja de las libertades, elige una licencia, predice qué puertas se abren (0 usar, 1 estudiar, 2 distribuir, 3 mejorar) y ábrela. Con GPL y MIT, mira qué pasa con una versión modificada.",
  "En Cápsula del tiempo, escoge el formato de cada archivo guardado en 2007, decide de quién depende y ábrelo hoy sin el programa original.",
  "En Equipa la sala, predice qué sale más caro, ajusta equipos y años, elige una ruta para cada necesidad y deja de pagar las suscripciones.",
  "Clasifica programas en «¿Libre, gratis o de pago?» para ganar estrellas y resuelve el quiz A2 y el texto A6.",
];

export const IDEAS: string[] = [
  "Software libre es el que concede las cuatro libertades: usar, estudiar, distribuir y mejorar.",
  "Gratis no es libre: un programa sin costo puede tener las cuatro puertas cerradas, y uno libre se puede vender.",
  "Poder leer el código no basta: la licencia debe permitir usarlo para cualquier propósito, modificarlo y compartirlo.",
  "Copyleft (GPL) protege que las versiones modificadas sigan siendo libres; una licencia permisiva (MIT) no lo exige.",
  "Un formato abierto hace que tus archivos sobrevivan al programa con que los creaste.",
  "Con el software como servicio no tienes una copia del programa: dependes de que el proveedor siga ahí y de pagar.",
];

/** Quiz A2 «Software libre — Opción múltiple» — verbatim. */
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Software libre — Opción múltiple",
  puntajeMinimo: 70,
  reactivos: [
    { enunciado: "¿Cuántas libertades definen al software libre?", opciones: ["Dos", "Cuatro", "Seis", "Diez"], respuestaCorrecta: 1, retroalimentacion: "Son cuatro libertades (0 a 3)." },
    { enunciado: "Para estudiar y adaptar un programa se necesita acceso a su…", opciones: ["código fuente", "factura", "número de serie", "contraseña de administrador"], respuestaCorrecta: 0, retroalimentacion: "El acceso al código fuente hace posible estudiarlo y modificarlo." },
    { enunciado: "El sistema operativo libre formado por el proyecto GNU y el núcleo Linux se llama…", opciones: ["Windows", "GNU/Linux", "macOS", "Android privativo"], respuestaCorrecta: 1, retroalimentacion: "GNU/Linux es el ejemplo emblemático de software libre." },
    { enunciado: "Una suite ofimática libre es…", opciones: ["LibreOffice", "una licencia privativa", "un antivirus de pago", "un navegador cerrado"], respuestaCorrecta: 0, retroalimentacion: "LibreOffice incluye procesador de texto, hoja de cálculo y presentaciones." },
  ],
};

/** Actividad A6 «Completa: las libertades del software» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "CD-I-P09-A6 · Completa: las libertades del software",
  instrucciones: "Completa con la palabra correcta.",
  partes: ["El software libre se define por cuatro ", ". Para estudiar y modificar un programa se necesita su código ", ". El sistema operativo libre por excelencia es ", ". Una suite ofimática libre es ", "."],
  huecos: [
    { respuesta: "libertades", alternativas: [], pista: "Son cuatro." },
    { respuesta: "fuente", alternativas: [], pista: "Código ___." },
    { respuesta: "GNU/Linux", alternativas: ["Linux", "GNU"], pista: "GNU + Linux." },
    { respuesta: "LibreOffice", alternativas: [], pista: "Writer, Calc, Impress." },
  ],
};
