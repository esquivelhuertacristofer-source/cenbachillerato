/**
 * Datos para el laboratorio "El espectro electromagnético"
 * (CNEYT-V-P05-A1, infografía "El espectro electromagnético: de las ondas de
 * radio a los rayos gamma"; UAC CNEYT-V; progresión 5 "Describe el espectro
 * electromagnético y sus aplicaciones tecnológicas y biomédicas").
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabEspectro.tsx) y la escena 3D (EspectroScene.tsx).
 *
 * Tres modos:
 *  (a) "espectro"     — explorador del espectro completo: el alumno recorre la
 *        frecuencia (escala logarítmica, de 10⁴ a 10²² Hz) y ve cómo cambian la
 *        longitud de onda (λ = c/f), la energía (E = h·f) y la banda; el umbral
 *        de radiación ionizante (rayos X y gamma) queda marcado.
 *  (b) "visible"      — acerca la diminuta franja de luz visible (380–700 nm):
 *        el alumno recorre la longitud de onda y ve el color, su frecuencia y su
 *        energía.
 *  (c) "aplicaciones" — ubica aplicaciones reales (WiFi, 5G, horno de microondas,
 *        GTM del INAOE, rayos X del IMSS, gamma del ININ…) sobre el espectro.
 *
 * Toda la física es de cálculo cerrado: c = λ·f y E = h·f, con c = 3×10⁸ m/s.
 * Los rangos de cada banda, los puntos clave, el glosario, las preguntas y el
 * contexto mexicano son verbatim de la infografía A1.
 */

export type Modo = "espectro" | "visible" | "aplicaciones";

/* ── Constantes físicas ───────────────────────────────────────────────────── */
export const C_LUZ = 3e8;          // m/s — rapidez de la luz en el vacío (≈299 792 km/s)
export const H_PLANCK = 6.626e-34; // J·s — constante de Planck
export const EV = 1.602e-19;       // J por electronvoltio

/* ── Dominio del explorador (frecuencia en escala log10) ──────────────────── */
export const LOGF_MIN = 4;         // 10⁴ Hz
export const LOGF_MAX = 22;        // 10²² Hz
export const LOGF_DEF = 14.74;     // ≈ 5.5×10¹⁴ Hz → cae en la luz visible

/* ── Bandas del espectro (de menor a mayor frecuencia) ────────────────────── */
export interface Banda {
  id: string;
  nombre: string;
  fMin: number;       // Hz
  fMax: number;       // Hz
  lambdaTxt: string;  // rango de λ, verbatim de la infografía
  color: string;
  icono: string;
  ionizante: boolean;
  esVisible?: boolean;
}

export const BANDAS: Banda[] = [
  { id: "radio",    nombre: "Ondas de radio", fMin: 1e4,      fMax: 3e9,      lambdaTxt: "10 cm – km",   color: "#f472b6", icono: "fa-tower-broadcast", ionizante: false },
  { id: "micro",    nombre: "Microondas",     fMin: 3e9,      fMax: 3e11,     lambdaTxt: "1 mm – 10 cm", color: "#fb923c", icono: "fa-satellite-dish",  ionizante: false },
  { id: "ir",       nombre: "Infrarrojo",     fMin: 3e11,     fMax: 4.2857e14, lambdaTxt: "700 nm – 1 mm", color: "#ef4444", icono: "fa-fire-flame-simple", ionizante: false },
  { id: "visible",  nombre: "Luz visible",    fMin: 4.2857e14, fMax: 7.8947e14, lambdaTxt: "380–700 nm",  color: "#22d3ee", icono: "fa-eye",             ionizante: false, esVisible: true },
  { id: "uv",       nombre: "Ultravioleta",   fMin: 7.8947e14, fMax: 3e16,    lambdaTxt: "10–380 nm",    color: "#a78bfa", icono: "fa-sun",             ionizante: false },
  { id: "x",        nombre: "Rayos X",        fMin: 3e16,     fMax: 3e19,     lambdaTxt: "0.01–10 nm",   color: "#38bdf8", icono: "fa-bone",            ionizante: true },
  { id: "gamma",    nombre: "Rayos gamma",    fMin: 3e19,     fMax: 1e22,     lambdaTxt: "< 0.01 nm",    color: "#e879f9", icono: "fa-radiation",       ionizante: true },
];

/** Banda a la que pertenece una frecuencia (Hz). */
export function bandaPorFrecuencia(f: number): Banda {
  for (const b of BANDAS) {
    if (f < b.fMax) return b;
  }
  return BANDAS[BANDAS.length - 1]!;
}

export function bandaPorId(id: string): Banda {
  return BANDAS.find((b) => b.id === id) ?? BANDAS[0]!;
}

/** Frecuencia (Hz) en la que empieza la radiación ionizante (inicio de los rayos X). */
export const F_IONIZANTE = 3e16;

export interface PuntoEM {
  f: number;        // frecuencia (Hz)
  lambda: number;   // longitud de onda (m) = c / f
  E_J: number;      // energía del fotón (J) = h · f
  E_eV: number;     // energía del fotón (eV)
  banda: Banda;
  ionizante: boolean;
}

/** Resuelve λ y energía a partir de la frecuencia. */
export function resolverEM(f: number): PuntoEM {
  const lambda = C_LUZ / f;
  const E_J = H_PLANCK * f;
  const banda = bandaPorFrecuencia(f);
  return { f, lambda, E_J, E_eV: E_J / EV, banda, ionizante: f >= F_IONIZANTE };
}

/* ── (b) Luz visible ──────────────────────────────────────────────────────── */
export const NM_MIN = 380;   // violeta
export const NM_MAX = 700;   // rojo (verbatim infografía: "380–700 nm")
export const NM_DEF = 550;   // verde-amarillo

export interface ColorVisible {
  nm: number;
  f: number;        // Hz
  E_eV: number;
  hex: string;
  nombre: string;
}

/** Nombre del color según la longitud de onda (nm). */
export function nombreColor(nm: number): string {
  if (nm < 450) return "violeta";
  if (nm < 485) return "azul";
  if (nm < 500) return "cian";
  if (nm < 565) return "verde";
  if (nm < 590) return "amarillo";
  if (nm < 625) return "naranja";
  return "rojo";
}

/**
 * Aproximación del color visible a partir de la longitud de onda (algoritmo de
 * Dan Bruton). Devuelve un color hex. Solo para visualización (380–700 nm).
 */
export function colorVisible(nm: number): string {
  let r = 0, g = 0, b = 0;
  if (nm >= 380 && nm < 440) { r = -(nm - 440) / (440 - 380); b = 1; }
  else if (nm >= 440 && nm < 490) { g = (nm - 440) / (490 - 440); b = 1; }
  else if (nm >= 490 && nm < 510) { g = 1; b = -(nm - 510) / (510 - 490); }
  else if (nm >= 510 && nm < 580) { r = (nm - 510) / (580 - 510); g = 1; }
  else if (nm >= 580 && nm < 645) { r = 1; g = -(nm - 645) / (645 - 580); }
  else if (nm >= 645 && nm <= 700) { r = 1; }
  // atenuación en los extremos del espectro visible
  let f = 1;
  if (nm >= 380 && nm < 420) f = 0.3 + (0.7 * (nm - 380)) / (420 - 380);
  else if (nm >= 645 && nm <= 700) f = 0.3 + (0.7 * (700 - nm)) / (700 - 645);
  const gamma = 0.8;
  const ch = (c: number) => {
    const v = Math.round(255 * Math.pow(Math.max(0, Math.min(1, c * f)), gamma));
    return v.toString(16).padStart(2, "0");
  };
  return `#${ch(r)}${ch(g)}${ch(b)}`;
}

/** Resuelve el color visible (color, frecuencia y energía) a partir de los nm. */
export function resolverVisible(nm: number): ColorVisible {
  const lambda = nm * 1e-9;
  const f = C_LUZ / lambda;
  const E_eV = (H_PLANCK * f) / EV;
  return { nm, f, E_eV, hex: colorVisible(nm), nombre: nombreColor(nm) };
}

/* ── (c) Aplicaciones reales (contexto mexicano de la infografía) ─────────── */
export interface Aplicacion {
  id: string;
  nombre: string;
  icono: string;
  f: number;          // Hz (frecuencia característica)
  categoria: "cotidiana" | "cientifica" | "biomedica";
  detalle: string;    // contexto mexicano verbatim/derivado de la infografía
}

export const APLICACIONES: Aplicacion[] = [
  { id: "fm",        nombre: "Radio FM",                 icono: "fa-radio",          f: 1e8,    categoria: "cotidiana", detalle: "Radiodifusión (~100 MHz). El IFT administra el espectro radioeléctrico nacional (9 kHz – 300 GHz)." },
  { id: "wifi",      nombre: "WiFi",                     icono: "fa-wifi",           f: 2.4e9,  categoria: "cotidiana", detalle: "Redes inalámbricas en la banda de 2.4 GHz (microondas)." },
  { id: "microondas", nombre: "Horno de microondas",    icono: "fa-kitchen-set",    f: 2.45e9, categoria: "cotidiana", detalle: "Calienta los alimentos agitando las moléculas de agua a 2.45 GHz." },
  { id: "cinco_g",   nombre: "5G (banda 3.5 GHz)",       icono: "fa-tower-cell",     f: 3.5e9,  categoria: "cotidiana", detalle: "En 2023 México realizó su primera subasta de espectro 5G en la banda 3.5 GHz." },
  { id: "gtm",       nombre: "GTM del INAOE",            icono: "fa-satellite-dish", f: 1.5e11, categoria: "cientifica", detalle: "Gran Telescopio Milimétrico (50 m, Volcán Sierra Negra, Puebla): el radiotelescopio de antena única más grande del mundo en su frecuencia." },
  { id: "ir_satelite", nombre: "Sensores IR (incendios)", icono: "fa-fire",         f: 3e13,   categoria: "cientifica", detalle: "Los satélites GOES y MODIS monitorean incendios forestales en México con sensores infrarrojos." },
  { id: "control",   nombre: "Control remoto IR",        icono: "fa-tv",             f: 3.2e14, categoria: "cotidiana", detalle: "Emite pulsos de luz infrarroja (~940 nm) que el ojo no ve." },
  { id: "oan",       nombre: "OAN San Pedro Mártir",     icono: "fa-binoculars",     f: 5.5e14, categoria: "cientifica", detalle: "Observatorio Astronómico Nacional de la UNAM (Baja California): estudia galaxias y exoplanetas con luz visible." },
  { id: "ozono",     nombre: "UV solar / capa de ozono", icono: "fa-sun",            f: 1.2e15, categoria: "cientifica", detalle: "El ozono absorbe casi todo el UV. Mario Molina (Nobel 1995, UNAM) demostró que los CFC lo destruyen." },
  { id: "rayosx",    nombre: "Rayos X médicos",          icono: "fa-bone",           f: 3e18,   categoria: "biomedica", detalle: "IMSS e ISSSTE operan más de 1 400 equipos. La tomografía fue clave en el diagnóstico de COVID-19." },
  { id: "gamma",     nombre: "Gamma médica (ININ)",      icono: "fa-radiation",      f: 1e20,   categoria: "biomedica", detalle: "El ININ (Ocoyoacac) aplica radiación gamma en braquiterapia oncológica y esterilización médica." },
];

export const APL_DEF = "cinco_g";

export function aplicacionPorId(id: string): Aplicacion {
  return APLICACIONES.find((a) => a.id === id) ?? APLICACIONES[0]!;
}

export const CAT_COLOR: Record<Aplicacion["categoria"], string> = {
  cotidiana: "#fbbf24",
  cientifica: "#34d399",
  biomedica: "#f87171",
};

export const CAT_ETQ: Record<Aplicacion["categoria"], string> = {
  cotidiana: "cotidiana",
  cientifica: "científica",
  biomedica: "biomédica",
};

/* ── Descripción del laboratorio ──────────────────────────────────────────── */
export const PROBLEMA =
  "Explorador del espectro electromagnético: recorre todas las longitudes de onda, de las ondas de radio (kilómetros) a los rayos gamma (picómetros). Todas las ondas EM viajan a la misma rapidez —la de la luz, 299 792 km/s— así que al subir la frecuencia la longitud de onda baja (c = λ·f) y la energía del fotón sube (E = h·f). Descubre dónde empieza la radiación ionizante, acércate a la diminuta franja visible y ubica aplicaciones reales de México sobre el espectro.";

/* ── Pasos para explorar (propios del simulador) ──────────────────────────── */
export const INSTRUCCIONES: string[] = [
  "Recorre la frecuencia con el deslizador y observa cómo la longitud de onda baja al subir la frecuencia (c = λ·f).",
  "Fíjate en que la energía del fotón (E = h·f) crece con la frecuencia: por eso los rayos gamma son tan penetrantes.",
  "Cruza el umbral marcado: a partir de los rayos X la radiación es ionizante (puede arrancar electrones y dañar el ADN).",
  "Cambia al modo Visible y recorre los 380–700 nm: comprueba que la luz que vemos es una franja diminuta del espectro.",
  "En el modo Aplicaciones, ubica WiFi, 5G, el GTM del INAOE, los rayos X del IMSS o la gamma del ININ sobre el espectro.",
];

/* ── Preguntas de reflexión (verbatim de la infografía A1) ────────────────── */
export const PREGUNTAS: string[] = [
  "El GTM del INAOE está a 4,600 m de altitud porque el vapor de agua absorbe parte de las microondas que intenta detectar. ¿Qué principio del espectro electromagnético explica por qué el vapor de agua absorbe esas frecuencias específicas y no otras?",
  "El IFT subastó espectro 5G a empresas privadas. ¿Debería el espectro electromagnético tratarse como un bien público estatal o como un recurso que puede venderse al mercado? ¿Qué implica cada postura para el acceso a internet en comunidades rurales e indígenas de México?",
  "Mario Molina recibió el Nobel por demostrar el daño de los CFC en el ozono, lo que llevó al Protocolo de Montreal. ¿Por qué la comunidad científica y los gobiernos actuaron relativamente rápido en ese caso, mientras que con el cambio climático ha sido mucho más lento? ¿Qué papel juegan los intereses económicos en cada caso?",
];

/* ── Puntos clave (verbatim de la infografía A1) ──────────────────────────── */
export const IDEAS: string[] = [
  "El espectro electromagnético abarca todas las longitudes de onda posibles de la radiación EM, desde ondas de radio (kilómetros) hasta rayos gamma (picómetros). Todas viajan a la misma velocidad: 299,792 km/s (velocidad de la luz en el vacío).",
  "Ondas de radio (10 cm – km): permiten telecomunicaciones. El IFT (Instituto Federal de Telecomunicaciones) administra el espectro radioeléctrico nacional. En 2023, México realizó su primera subasta de espectro 5G en la banda 3.5 GHz.",
  "Microondas (1 mm – 10 cm): el Gran Telescopio Milimétrico (GTM) del INAOE en el Volcán Sierra Negra (Puebla), a 4,600 m de altitud, es el radiotelescopio de antena única más grande del mundo en su frecuencia, con 50 m de diámetro.",
  "Infrarrojo (700 nm – 1 mm): los satélites GOES y MODIS usan sensores infrarrojos para monitorear incendios forestales en México en tiempo real. En 2023 se registraron más de 10,000 incendios, principalmente en Durango, Chihuahua y Jalisco.",
  "Luz visible (380–700 nm): el Observatorio Astronómico Nacional (OAN) de la UNAM en San Pedro Mártir, Baja California —2,800 m de altitud, más de 300 noches despejadas al año— estudia galaxias lejanas y exoplanetas con telescopios ópticos.",
  "Ultravioleta (10–380 nm): el ozono estratosférico absorbe la mayoría. Mario Molina (Premio Nobel de Química 1995, UNAM) demostró que los CFC destruyen la capa de ozono. México ratificó el Protocolo de Montreal en 1985. La recuperación del ozono es uno de los mayores éxitos ambientales globales.",
  "Rayos X (0.01–10 nm): el IMSS y el ISSSTE operan más de 1,400 equipos de rayos X en México. La tomografía computarizada —que usa rayos X con reconstrucción digital 3D— fue esencial para el diagnóstico de COVID-19 durante la pandemia.",
  "Rayos gamma (<0.01 nm): el ININ (Instituto Nacional de Investigaciones Nucleares) en Ocoyoacac, Estado de México, aplica radiación gamma en braquiterapia oncológica y en la esterilización de alimentos y dispositivos médicos.",
  "El GTM del INAOE participó en el consorcio Event Horizon Telescope que en 2019 capturó la primera imagen de un agujero negro (M87*). Esta contribución mexicana forma parte de uno de los descubrimientos astronómicos más importantes del siglo XXI.",
];

/* ── Glosario (verbatim de la infografía A1) ──────────────────────────────── */
export const GLOSARIO: { termino: string; definicion: string }[] = [
  { termino: "Longitud de onda", definicion: "Distancia entre dos crestas consecutivas de una onda. Se mide en metros. Las ondas con mayor longitud de onda tienen menor frecuencia y menor energía." },
  { termino: "Frecuencia", definicion: "Número de oscilaciones por segundo de una onda, medida en hercios (Hz). Las ondas de alta frecuencia tienen alta energía —por eso los rayos gamma son ionizantes y peligrosos para el ADN celular." },
  { termino: "Radiación ionizante", definicion: "Radiación con suficiente energía para arrancar electrones de los átomos. Los rayos X y los rayos gamma son ionizantes. La radiación ionizante puede dañar el ADN y provocar mutaciones o cáncer." },
  { termino: "Espectro radioeléctrico", definicion: "Porción del espectro EM con frecuencias entre 9 kHz y 300 GHz, usada para comunicaciones. Es un bien público administrado por el Estado —en México, el IFT asigna las frecuencias mediante concesiones y subastas públicas." },
  { termino: "Telescopio milimétrico", definicion: "Instrumento astronómico que detecta radiación en la banda milimétrica y submilimétrica del espectro. Revela galaxias en formación, nubes moleculares y la radiación de fondo cósmico de microondas que proviene del Big Bang." },
];

/* ── Contexto mexicano y fuente (verbatim de la infografía A1) ────────────── */
export const CONTEXTO =
  "México tiene contribuciones significativas a la astronomía y física del espectro electromagnético. El Gran Telescopio Milimétrico del INAOE, en colaboración con la Universidad de Massachusetts Amherst, es el instrumento de observación milimétrica más sensible del mundo y contribuyó al mapa tridimensional del universo lejano. Junto con instalaciones globales del consorcio Event Horizon Telescope, capturó en 2019 la primera fotografía de un agujero negro.";

export const FUENTE =
  "INAOE — Gran Telescopio Milimétrico: avances y resultados 2023; IFT — Informe Estadístico de Telecomunicaciones en México 2023; AEM — Programa Espacial Mexicano 2021–2030.";

/* ── Ejemplo resuelto (cálculo cerrado, didáctico) ────────────────────────── */
export const EJEMPLO = {
  enunciado: "Una estación de radio FM transmite a 100 MHz (1×10⁸ Hz). ¿Cuál es su longitud de onda?",
  f: 1e8,
  lambda: 3,
  solucion: "c = λ·f → λ = c/f = (3×10⁸ m/s)/(1×10⁸ Hz) = 3 m.",
};

/* ── Datos rápidos (tarjetas) ─────────────────────────────────────────────── */
export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "c = 299 792 km/s", texto: "rapidez de la luz: igual para TODA onda EM", icono: "fa-gauge-high" },
  { valor: "c = λ·f", texto: "más frecuencia ⇒ menos longitud de onda", icono: "fa-wave-square" },
  { valor: "E = h·f", texto: "más frecuencia ⇒ más energía del fotón", icono: "fa-bolt" },
  { valor: "9 kHz – 300 GHz", texto: "espectro radioeléctrico que administra el IFT", icono: "fa-tower-broadcast" },
];

/* ── Formato (es-MX) ──────────────────────────────────────────────────────── */
const SUP: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
const sup = (n: number): string => String(n).split("").map((c) => SUP[c] ?? c).join("");

const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmt0 = (n: number): string => ES(n, 0);
export const fmt1 = (n: number): string => ES(n, 1);
export const fmt2 = (n: number): string => ES(n, 2);

/** Notación científica con superíndices: 3.5 × 10⁹ */
export function fmtSci(n: number): string {
  if (n === 0) return "0";
  const exp = Math.floor(Math.log10(Math.abs(n)));
  const mant = n / Math.pow(10, exp);
  const m = ES(mant, 2).replace(/[.,]?0+$/, "");
  return `${m} × 10${sup(exp)}`;
}

/** Frecuencia legible: Hz, kHz, MHz, GHz, THz, PHz, EHz o científica. */
export function fmtFrec(hz: number): string {
  if (hz >= 1e18) return fmtSci(hz) + " Hz";
  if (hz >= 1e15) return `${ES(hz / 1e15, 2)} PHz`;
  if (hz >= 1e12) return `${ES(hz / 1e12, 2)} THz`;
  if (hz >= 1e9) return `${ES(hz / 1e9, 2)} GHz`;
  if (hz >= 1e6) return `${ES(hz / 1e6, 2)} MHz`;
  if (hz >= 1e3) return `${ES(hz / 1e3, 2)} kHz`;
  return `${ES(hz, 0)} Hz`;
}

/** Longitud de onda legible: km, m, cm, mm, µm, nm o pm. */
export function fmtLambda(m: number): string {
  if (m >= 1000) return `${ES(m / 1000, 2)} km`;
  if (m >= 1) return `${ES(m, 2)} m`;
  if (m >= 1e-2) return `${ES(m * 100, 2)} cm`;
  if (m >= 1e-3) return `${ES(m * 1000, 2)} mm`;
  if (m >= 1e-6) return `${ES(m * 1e6, 2)} µm`;
  if (m >= 1e-9) return `${ES(m * 1e9, 1)} nm`;
  return `${ES(m * 1e12, 2)} pm`;
}

/** Energía del fotón legible: µeV, meV, eV, keV, MeV o científica. */
export function fmtEnergia(eV: number): string {
  if (eV >= 1e6) return `${ES(eV / 1e6, 2)} MeV`;
  if (eV >= 1e3) return `${ES(eV / 1e3, 2)} keV`;
  if (eV >= 1) return `${ES(eV, 2)} eV`;
  if (eV >= 1e-3) return `${ES(eV * 1e3, 2)} meV`;
  if (eV >= 1e-6) return `${ES(eV * 1e6, 2)} µeV`;
  return `${fmtSci(eV)} eV`;
}
