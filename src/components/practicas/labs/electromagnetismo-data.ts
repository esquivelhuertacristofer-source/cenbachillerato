/**
 * Datos para el laboratorio "Electromagnetismo: Ohm, Faraday y motores"
 * (CNEYT-V-P07-A2, ejercicio matemático "Calculando electromagnetismo: Ohm,
 * Faraday y motores"; UAC CNEYT-V "La energía en procesos de vida diaria";
 * progresión 7 "Examina los principios del electromagnetismo y su aplicación en
 * motores, generadores y tecnologías cotidianas").
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabElectromagnetismo.tsx) y la escena 3D (ElectromagnetismoScene.tsx).
 *
 * Tres modos (mapean el ejercicio A2 y la lectura A1):
 *  (a) "circuito"   — ley de Ohm V = I·R y potencia P = V·I = I²R = V²/R. El
 *        alumno conecta una resistencia a la red de CFE, lee la corriente y la
 *        potencia, y calcula la energía (kWh) y el costo en pesos. Es la parte
 *        (a) del problema A2: resistencia de 470 Ω a 120 V durante 8 h.
 *  (b) "generador"  — inducción de Faraday: una espira de N vueltas gira en un
 *        campo magnético B y produce una FEM alterna FEM = N·B·A·ω·sen(ωt). Es
 *        el principio de las hidroeléctricas (presa Chicoasén, Río Grijalva).
 *  (c) "motor"      — conversión de energía eléctrica en mecánica con eficiencia
 *        η: P_mec = η·P_elec; el resto se disipa como calor (P = I²R). Es la
 *        parte (b) del problema A2: el motor del Metro CDMX (92 %, 150 kW).
 *
 * Toda la física es de cálculo cerrado: ley de Ohm, potencia eléctrica, ley de
 * inducción de Faraday (FEM senoidal de un generador) y balance de eficiencia.
 * Las leyes, los valores y el contexto mexicano son verbatim de la lectura A1 y
 * del ejercicio A2.
 */

export type Modo = "circuito" | "generador" | "motor";

/* ── Constantes físicas (verbatim de la lectura A1) ───────────────────────── */
export const K_COULOMB = 8.99e9; // N·m²/C² — constante de Coulomb
export const CFE_V = 127;        // V — tensión nominal de la red doméstica en México
export const CFE_HZ = 60;        // Hz — frecuencia de la red de CFE
export const HP_KW = 0.7457;     // kW por caballo de fuerza (1 hp = 0.7457 kW)

/* ── (a) Circuito — ley de Ohm ────────────────────────────────────────────── */
export const V_MIN = 1.5;
export const V_MAX = 240;
export const V_DEF = 120;        // verbatim A2 (a): 120 V
export const R_MIN = 1;
export const R_MAX = 2000;
export const R_DEF = 470;        // verbatim A2 (a): 470 Ω
export const H_MIN = 1;
export const H_MAX = 24;
export const H_DEF = 8;          // verbatim A2 (a): 8 h
export const PRECIO_MIN = 0.5;
export const PRECIO_MAX = 5;
export const PRECIO_DEF = 1.5;   // verbatim A2 (a): $1.50 MXN por kWh

/* ── (b) Generador — inducción de Faraday ─────────────────────────────────── */
export const N_MIN = 10;
export const N_MAX = 400;
export const N_DEF = 100;        // número de vueltas de la bobina
export const B_MIN = 0.05;
export const B_MAX = 1.5;
export const B_DEF = 0.4;        // T — campo magnético
export const AREA_MIN = 0.005;
export const AREA_MAX = 0.2;
export const AREA_DEF = 0.02;    // m² — área de la espira
export const F_MIN = 10;
export const F_MAX = 120;
export const F_DEF = 60;         // Hz — la red de CFE gira a 60 Hz

/* ── (c) Motor — eficiencia ───────────────────────────────────────────────── */
export const PEL_MIN = 1;
export const PEL_MAX = 300;
export const PEL_DEF = 150;      // kW — verbatim A2 (b): 150 kW
export const EFIC_MIN = 30;
export const EFIC_MAX = 99;
export const EFIC_DEF = 92;      // % — verbatim A2 (b): eficiencia 92 %

/* ── Tipos de resultado ───────────────────────────────────────────────────── */
export interface Circuito {
  V: number;          // tensión (V)
  R: number;          // resistencia (Ω)
  I: number;          // corriente = V/R (A)
  P: number;          // potencia = V·I = V²/R (W)
  horas: number;      // tiempo de uso (h)
  energiaWh: number;  // energía = P·horas (Wh)
  energiaKwh: number; // energía (kWh)
  precio: number;     // costo de la energía ($/kWh)
  costo: number;      // costo total (MXN)
}

/** Ley de Ohm + potencia + energía + costo (parte (a) del problema A2). */
export function resolverCircuito(V: number, R: number, horas: number, precio: number): Circuito {
  const I = V / R;
  const P = V * I; // = V²/R = I²·R
  const energiaWh = P * horas;
  const energiaKwh = energiaWh / 1000;
  const costo = energiaKwh * precio;
  return { V, R, I, P, horas, energiaWh, energiaKwh, precio, costo };
}

export interface Generador {
  N: number;        // número de vueltas
  B: number;        // campo magnético (T)
  A: number;        // área de la espira (m²)
  f: number;        // frecuencia de giro (Hz)
  omega: number;    // velocidad angular ω = 2πf (rad/s)
  femPico: number;  // FEM máxima = N·B·A·ω (V)
  femRms: number;   // FEM eficaz = FEM_pico/√2 (V)
}

/** FEM senoidal de un generador (ley de inducción de Faraday). */
export function resolverGenerador(N: number, B: number, A: number, f: number): Generador {
  const omega = 2 * Math.PI * f;
  const femPico = N * B * A * omega;
  const femRms = femPico / Math.SQRT2;
  return { N, B, A, f, omega, femPico, femRms };
}

/** FEM instantánea FEM(t) = FEM_pico·sen(ωt). */
export function femEnT(g: Generador, t: number): number {
  return g.femPico * Math.sin(g.omega * t);
}

export interface Motor {
  pElec: number;     // potencia eléctrica de entrada (kW)
  efic: number;      // eficiencia (%)
  pMec: number;      // potencia mecánica útil = η·P_elec (kW)
  pPerdida: number;  // potencia disipada como calor = P_elec − P_mec (kW)
  hp: number;        // potencia mecánica en caballos de fuerza
}

/** Balance de eficiencia de un motor (parte (b) del problema A2). */
export function resolverMotor(pElec: number, eficPct: number): Motor {
  const efic = eficPct;
  const pMec = (efic / 100) * pElec;
  const pPerdida = pElec - pMec;
  const hp = pMec / HP_KW;
  return { pElec, efic, pMec, pPerdida, hp };
}

/* ── Escenarios preestablecidos ───────────────────────────────────────────── */
export interface CasoCircuito {
  id: string;
  etq: string;
  V: number;
  R: number;
  nota: string;
}
/**
 * El caso "resistencia" es el problema A2 (a) verbatim. Los electrodomésticos
 * son los de la lectura A1: se modelan como una resistencia equivalente a la red
 * de CFE (127 V) que disipa la potencia indicada (R = V²/P).
 */
export const CASOS_CIRCUITO: CasoCircuito[] = [
  { id: "a2",        etq: "Resistencia A2 · 470 Ω a 120 V", V: 120, R: 470,  nota: "El problema (a) del ejercicio A2: ¿cuánta corriente, potencia, energía y costo?" },
  { id: "led",       etq: "Foco LED · 10 W",                 V: 127, R: 1613, nota: "Un foco LED de 10 W consume muy poca corriente: por eso ahorra energía." },
  { id: "refri",     etq: "Refrigerador · ~300 W",           V: 127, R: 54,   nota: "El refrigerador (150–400 W) trabaja casi todo el día: pesa en el recibo de luz." },
  { id: "microondas", etq: "Microondas · ~1100 W",           V: 127, R: 15,   nota: "El microondas (1000–1200 W) pide mucha corriente, pero por poco tiempo." },
  { id: "calentador", etq: "Calentador · 2000 W",            V: 127, R: 8,    nota: "Un calentador eléctrico de 2000 W es de los aparatos que más consumen." },
];

export interface CasoGenerador {
  id: string;
  etq: string;
  N: number;
  B: number;
  A: number;
  f: number;
  nota: string;
}
export const CASOS_GENERADOR: CasoGenerador[] = [
  { id: "cfe",    etq: "Red CFE · 60 Hz",        N: 100, B: 0.4, A: 0.02, f: 60,  nota: "En México la red gira a 60 Hz: el generador da 60 ciclos por segundo." },
  { id: "vueltas", etq: "Más vueltas en la bobina", N: 300, B: 0.4, A: 0.02, f: 60,  nota: "Más vueltas (N) → más FEM: la FEM crece en proporción directa con N." },
  { id: "campo",  etq: "Imán más fuerte",        N: 100, B: 1.2, A: 0.02, f: 60,  nota: "Un campo B más intenso induce mayor FEM: FEM_pico = N·B·A·ω." },
  { id: "rapido", etq: "Gira más rápido",        N: 100, B: 0.4, A: 0.02, f: 90,  nota: "A mayor frecuencia de giro (ω = 2πf), mayor FEM inducida." },
];

export interface CasoMotor {
  id: string;
  etq: string;
  pElec: number;
  efic: number;
  nota: string;
}
export const CASOS_MOTOR: CasoMotor[] = [
  { id: "metro",      etq: "Motor del Metro CDMX · 92 %", pElec: 150, efic: 92, nota: "El problema (b) del ejercicio A2: motor de 150 kW con 92 % de eficiencia." },
  { id: "industrial", etq: "Motor industrial · 95 %",     pElec: 75,  efic: 95, nota: "Los motores eléctricos modernos alcanzan 90–97 % de eficiencia." },
  { id: "pequeno",    etq: "Motor pequeño · 85 %",        pElec: 5,   efic: 85, nota: "Hasta un motor pequeño supera con mucho a un motor de combustión." },
  { id: "combustion", etq: "Compara: combustión ~35 %",   pElec: 150, efic: 35, nota: "Un motor de combustión interna desperdicia ~65 % de la energía en calor." },
];

/* ── Texto: descripción del laboratorio ───────────────────────────────────── */
export const PROBLEMA =
  "Banco de electromagnetismo: la electricidad y el magnetismo son dos caras del mismo fenómeno. Conecta una resistencia a la red de CFE y mide la corriente, la potencia y el costo con la ley de Ohm; haz girar una bobina dentro de un campo magnético para generar electricidad por inducción (como una hidroeléctrica); y observa cómo un motor convierte la energía eléctrica en movimiento, con una pequeña parte que se pierde como calor. Es el ejercicio A2 'Calculando electromagnetismo: Ohm, Faraday y motores' hecho manipulable en 3D.";

/* ── Instrucciones (basadas en el ejercicio A2 y la lectura A1) ───────────── */
export const INSTRUCCIONES: string[] = [
  "Modo Circuito: ajusta la tensión V y la resistencia R y observa la corriente I = V/R y la potencia P = V²/R.",
  "Cambia las horas de uso y el precio del kWh para calcular la energía y el costo en pesos.",
  "Usa el preajuste 'Resistencia A2' (470 Ω a 120 V, 8 h, $1.50) y verifica el resultado del ejercicio.",
  "Modo Generador: cambia el número de vueltas N, el campo B, el área A y la frecuencia f, y mira la onda de FEM.",
  "Comprueba que la FEM máxima es FEM = N·B·A·ω, con ω = 2πf.",
  "Modo Motor: fija la potencia eléctrica y la eficiencia, y compara la potencia mecánica útil contra el calor perdido.",
];

/* ── Preguntas de reflexión (basadas en la lectura A1) ────────────────────── */
export const PREGUNTAS: string[] = [
  "¿Por qué un foco LED de 10 W cuesta mucho menos al mes que un calentador de 2000 W?",
  "¿Qué le pasa a la FEM de un generador si duplicas el número de vueltas de la bobina?",
  "Si un motor eléctrico tiene 92 % de eficiencia y uno de combustión ~35 %, ¿cuál desperdicia más energía y por qué?",
];

/* ── Ideas clave (fieles a la lectura A1) ─────────────────────────────────── */
export const IDEAS: string[] = [
  "La ley de Coulomb describe la fuerza entre cargas: F = k·q₁·q₂/r², con k = 8.99×10⁹ N·m²/C². Cargas iguales se repelen; distintas se atraen.",
  "Corriente eléctrica es el flujo de carga. La ley de Ohm relaciona tensión, corriente y resistencia: V = I·R.",
  "La potencia eléctrica es P = V·I = I²·R = V²/R (en watts). La energía es P·tiempo; el recibo de luz se cobra en kilowatt-hora (kWh).",
  "En México la red doméstica de CFE entrega 127 V en corriente alterna a 60 Hz.",
  "Inducción electromagnética (Faraday, 1831): un campo magnético que cambia en el tiempo induce una FEM. Es la base de generadores y transformadores.",
  "Un generador convierte energía mecánica en eléctrica: una bobina gira en un campo magnético y produce FEM alterna FEM = N·B·A·ω·sen(ωt). La presa Chicoasén (Río Grijalva, Chiapas) genera 2400 MW así.",
  "Un motor hace lo contrario: convierte energía eléctrica en mecánica usando la fuerza de Lorentz F = q·v×B sobre las cargas en el campo. Los trenes del Metro CDMX usan motores eléctricos.",
  "Los motores eléctricos alcanzan 90–97 % de eficiencia; un motor de combustión interna ronda apenas 35 %: el resto se pierde como calor.",
  "El transformador cambia la tensión sin cambiar la frecuencia: V₂/V₁ = N₂/N₁. Permite subir la tensión para transmitir y bajarla para usarla.",
  "La CFE transmite a 400 kV para reducir las pérdidas por calor en los cables (P_pérdida = I²·R): a mayor tensión, menor corriente y menos pérdidas. Todo forma el Sistema Eléctrico Nacional.",
];

/* ── Glosario (fiel a la lectura A1) ──────────────────────────────────────── */
export const GLOSARIO: { termino: string; definicion: string }[] = [
  { termino: "Ley de Ohm", definicion: "Relación entre tensión, corriente y resistencia: V = I·R. A más resistencia, menos corriente para la misma tensión." },
  { termino: "Potencia eléctrica", definicion: "Rapidez con que se usa la energía: P = V·I = I²·R = V²/R, medida en watts (W). La energía es P·tiempo y se cobra en kWh." },
  { termino: "Inducción electromagnética", definicion: "Generación de una FEM por un campo magnético que cambia con el tiempo. La descubrió Michael Faraday en 1831." },
  { termino: "Generador", definicion: "Máquina que convierte energía mecánica en eléctrica: una bobina gira en un campo magnético e induce FEM alterna." },
  { termino: "Motor eléctrico", definicion: "Máquina que convierte energía eléctrica en movimiento mediante la fuerza de Lorentz (F = q·v×B) sobre las cargas en un campo magnético." },
  { termino: "Eficiencia (η)", definicion: "Fracción de la energía de entrada que se aprovecha como salida útil: η = P_útil/P_entrada. El resto se disipa como calor." },
  { termino: "Transformador", definicion: "Dispositivo que cambia la tensión sin cambiar la frecuencia: V₂/V₁ = N₂/N₁. Esencial para transmitir electricidad." },
];

/* ── Contexto y fuente (verbatim/fiel a la lectura A1) ────────────────────── */
export const CONTEXTO =
  "El Sistema Eléctrico Nacional lleva la energía desde las plantas hasta tu casa. La CFE transmite a 400 kV para minimizar las pérdidas por calor (P = I²·R) en los cables. La presa Chicoasén, sobre el Río Grijalva en Chiapas, es una de las mayores hidroeléctricas del país (2400 MW). El Metro de la Ciudad de México mueve sus trenes con motores eléctricos de alta eficiencia.";

export const FUENTE =
  "Material elaborado para CEN Bachillerato — CNEYT-V. Ref: Serway & Jewett, Física para ciencias e ingeniería (9ª ed.); CFE (2023); STC Metro CDMX.";

/* ── Ejemplo resuelto (verbatim del ejercicio A2) ─────────────────────────── */
export const EJEMPLO_A = {
  enunciado: "(a) Una resistencia de 470 Ω se conecta a 120 V (red de CFE). Calcula la corriente, la potencia, la energía consumida en 8 h y el costo si el kWh cuesta $1.50.",
  pasos: [
    "I = V/R = 120 / 470 ≈ 0.255 A",
    "P = V²/R = 120² / 470 ≈ 30.6 W",
    "E = P·t = 30.6 W × 8 h = 244.8 Wh ≈ 0.245 kWh",
    "Costo = 0.245 kWh × $1.50 ≈ $0.37 MXN",
  ],
  resultado: "I ≈ 0.255 A · P ≈ 30.6 W · E ≈ 0.245 kWh · costo ≈ $0.37",
};

export const EJEMPLO_B = {
  enunciado: "(b) Un motor del Metro CDMX con 92 % de eficiencia consume 150 kW. ¿Cuánta potencia mecánica útil entrega?",
  pasos: [
    "P_mec = η·P_elec = 0.92 × 150 kW = 138 kW",
    "Calor perdido = 150 − 138 = 12 kW (el 8 %)",
    "138 kW ≈ 185 hp (1 hp = 0.7457 kW)",
  ],
  resultado: "P_mec = 138 kW ≈ 185 hp · pérdida = 12 kW",
};

/* ── Datos rápidos (tarjetas) ─────────────────────────────────────────────── */
export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "V = I·R", texto: "ley de Ohm: tensión, corriente y resistencia", icono: "fa-bolt" },
  { valor: "P = V·I = I²R = V²/R", texto: "potencia eléctrica (W); energía = P·t (kWh)", icono: "fa-plug-circle-bolt" },
  { valor: "FEM = N·B·A·ω·sen(ωt)", texto: "inducción de Faraday: FEM de un generador", icono: "fa-wave-square" },
  { valor: "η = P_mec / P_elec", texto: "eficiencia de un motor (resto = calor)", icono: "fa-gears" },
];

/* ── Formato (es-MX) ──────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmt0 = (n: number): string => ES(n, 0);
export const fmt1 = (n: number): string => ES(n, 1);
export const fmt2 = (n: number): string => ES(n, 2);
export const fmt3 = (n: number): string => ES(n, 3);

/** Tensión (V). */
export const fmtV = (v: number): string => `${ES(v, v < 10 ? 1 : 0)} V`;
/** Corriente (A). */
export const fmtA = (a: number): string => `${ES(a, a < 1 ? 3 : a < 10 ? 2 : 1)} A`;
/** Resistencia (Ω). */
export const fmtR = (r: number): string => `${ES(r, 0)} Ω`;
/** Potencia en W o kW según magnitud. */
export function fmtW(w: number): string {
  if (Math.abs(w) >= 1000) return `${ES(w / 1000, 2)} kW`;
  return `${ES(w, 1)} W`;
}
/** Potencia siempre en kW. */
export const fmtKw = (kw: number): string => `${ES(kw, kw < 10 ? 2 : 1)} kW`;
/** Energía (kWh). */
export const fmtKwh = (kwh: number): string => `${ES(kwh, 3)} kWh`;
/** Costo en pesos. */
export const fmtMXN = (m: number): string => `$${ES(m, 2)}`;
/** Porcentaje. */
export const fmtPct = (p: number): string => `${ES(p, 0)} %`;
/** Frecuencia (Hz). */
export const fmtHz = (h: number): string => `${ES(h, 0)} Hz`;
/** Caballos de fuerza. */
export const fmtHp = (hp: number): string => `${ES(hp, 0)} hp`;
