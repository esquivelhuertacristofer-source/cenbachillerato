/**
 * Datos y modelo del laboratorio "Consumo energético e impacto ambiental"
 * (CNEYT-II, progresión 10; actividades CNEYT-II-P06-A1…A9).
 *
 * Anclas (VERBATIM de la plataforma):
 *   - A1 lectura «Consumo energético e impacto ambiental»: marco teórico,
 *     recuadro y preguntas de comprensión.
 *   - A2 quiz «¿Qué sabemos sobre la huella de carbono?»: reto evaluable.
 *   - A3 debate «¿Quién es responsable del cambio climático?»: tema, posturas y
 *     reglas.
 *   - A4 verdadero/falso: hechos. A5 glosario. A6 completa el texto.
 *   - A7 autoevaluación: pregunta de reflexión final.
 *
 * Modelo (NO verbatim, cifras reales con su fuente; lo aproximado se marca):
 *   - Factor de emisión del Sistema Eléctrico Nacional 2024: 0.444 tCO₂e/MWh
 *     (aviso CRE–SENER publicado en 2025). 2023: 0.438.
 *   - Tarifa doméstica 1 de CFE, bloques bimestrales 150 / 130 / resto kWh con
 *     precios de referencia de 2025 (aproximados: CFE los ajusta cada mes).
 *   - Pérdidas en transmisión y distribución del SEN: 12.2 % en 2023
 *     (PRODESEN 2024-2038; técnicas y no técnicas).
 *   - Factores de emisión de combustibles: IPCC 2006 (kg CO₂/GJ).
 *   - Huella de alimentos: medianas de Poore y Nemecek (Science, 2018).
 *   - Potencias de aparatos y horas de uso: valores típicos ilustrativos.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

export const num = (v: number, dec = 0) => v.toLocaleString("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec });
export const pesos = (v: number) => `$${num(v, 2)}`;

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "casa" | "cadena" | "huella";
export const MODOS: Modo[] = ["casa", "cadena", "huella"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  casa: { etq: "Mi casa y el recibo", subtitulo: "Aparatos, kWh, tarifa y consumo fantasma", icono: "fa-house-chimney", color: "#fbbf24" },
  cadena: { etq: "De la planta al foco", subtitulo: "Cuánta energía se pierde en el camino", icono: "fa-industry", color: "#38bdf8" },
  huella: { etq: "Mi huella de carbono", subtitulo: "El CO₂ de un año, a tamaño real", icono: "fa-shoe-prints", color: "#a3e635" },
};

/* ════════════════════════════════════════════════════════════════════════
 * Constantes con fuente
 * ════════════════════════════════════════════════════════════════════════ */

/** Factor de emisión del SEN 2024 (CRE–SENER): kg CO₂e por kWh consumido. */
export const FE_SEN = 0.444;
export const FE_SEN_ANIO = 2024;
/** Pérdidas de energía en la red de transmisión y distribución, 2023 (PRODESEN 2024-2038). */
export const PERDIDAS_RED = 0.122;
/** Días de un bimestre de facturación. */
export const DIAS_BIMESTRE = 60;
export const IVA = 0.16;

/** Tarifa doméstica 1 (CFE): bloques bimestrales. Precios de referencia 2025, aproximados, sin IVA. */
export const BLOQUES: { id: "basico" | "intermedio" | "excedente"; etq: string; hasta: number; precio: number; color: string }[] = [
  { id: "basico", etq: "Básico", hasta: 150, precio: 0.987, color: "#34d399" },
  { id: "intermedio", etq: "Intermedio", hasta: 280, precio: 1.198, color: "#fbbf24" },
  { id: "excedente", etq: "Excedente", hasta: Infinity, precio: 3.218, color: "#f87171" },
];
/** Límite de alto consumo de la tarifa 1: 250 kWh al mes en promedio anual → pasa a DAC. */
export const LIMITE_DAC_BIM = 500;

export interface Recibo {
  kwh: number;
  tramos: { id: string; etq: string; kwh: number; precio: number; importe: number; color: string }[];
  subtotal: number;
  iva: number;
  total: number;
  escalon: "basico" | "intermedio" | "excedente";
}

export function recibo(kwhBimestre: number): Recibo {
  let previo = 0;
  const tramos = BLOQUES.map((b) => {
    const kwh = Math.max(0, Math.min(kwhBimestre, b.hasta) - previo);
    previo = Math.min(kwhBimestre, b.hasta);
    return { id: b.id, etq: b.etq, kwh, precio: b.precio, importe: kwh * b.precio, color: b.color };
  });
  const subtotal = tramos.reduce((a, t) => a + t.importe, 0);
  const escalon = kwhBimestre > 280 ? "excedente" : kwhBimestre > 150 ? "intermedio" : "basico";
  return { kwh: kwhBimestre, tramos, subtotal, iva: subtotal * IVA, total: subtotal * (1 + IVA), escalon };
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. MI CASA
 * ════════════════════════════════════════════════════════════════════════ */

export type CuartoId = "cocina" | "sala" | "recamara" | "lavado";
export type AparatoId = "refri" | "focos" | "tv" | "deco" | "consola" | "modem" | "micro" | "lavadora" | "plancha" | "bomba" | "ventilador" | "laptop";
export type FocoId = "incandescente" | "lfc" | "led";
export type RefriId = "antiguo" | "eficiente";

export interface FocoDef {
  id: FocoId;
  etq: string;
  w: number;
  lumenes: number;
  color: string;
  nota: string;
}

/** Tres focos que dan la misma luz (≈ 800 lm). */
export const FOCOS: FocoDef[] = [
  { id: "incandescente", etq: "Incandescente 60 W", w: 60, lumenes: 800, color: "#fb923c", nota: "Calienta un filamento hasta que brilla. En México dejaron de venderse desde 2015 (NOM-028-ENER-2010)." },
  { id: "lfc", etq: "Fluorescente compacto 14 W", w: 14, lumenes: 800, color: "#e0f2fe", nota: "Excita un gas con electricidad y un recubrimiento convierte la radiación ultravioleta en luz." },
  { id: "led", etq: "LED 9 W", w: 9, lumenes: 800, color: "#f8fafc", nota: "Un semiconductor emite luz directamente: la misma luz con 85 % menos electricidad que el incandescente." },
];

/** Luz blanca ideal ≈ 250 lm/W: sirve para estimar qué fracción de la electricidad sale como luz visible. */
export const LM_W_LUZ_IDEAL = 250;
export const eficacia = (f: FocoDef) => f.lumenes / f.w;
export const fraccionLuz = (f: FocoDef) => eficacia(f) / LM_W_LUZ_IDEAL;

export const REFRIS: { id: RefriId; etq: string; wMedia: number; nota: string }[] = [
  { id: "antiguo", etq: "Refrigerador de más de 10 años", wMedia: 70, nota: "Aislamiento y compresor viejos: el motor pasa más tiempo encendido." },
  { id: "eficiente", etq: "Refrigerador eficiente (con etiqueta)", wMedia: 38, nota: "Mismo frío con casi la mitad de energía." },
];

export interface AparatoDef {
  id: AparatoId;
  etq: string;
  icono: string;
  cuarto: CuartoId;
  /** Potencia al usarlo (W). En refri y focos se calcula aparte. */
  w: number;
  /** Horas de uso al día por defecto. */
  horas: number;
  hMax: number;
  paso: number;
  /** Potencia en modo espera cuando está enchufado sin usarse (W). */
  espera: number;
  /** Funciona las 24 h (refri, módem): no tiene horas ajustables. */
  continuo?: boolean;
  nota: string;
}

export const APARATOS: AparatoDef[] = [
  { id: "refri", etq: "Refrigerador", icono: "fa-temperature-low", cuarto: "cocina", w: 38, horas: 24, hMax: 24, paso: 1, espera: 0, continuo: true, nota: "Funciona día y noche; la potencia es la media porque el compresor prende y apaga." },
  { id: "focos", etq: "8 focos", icono: "fa-lightbulb", cuarto: "sala", w: 60, horas: 5, hMax: 12, paso: 0.5, espera: 0, nota: "La iluminación de toda la casa: ocho focos encendidos en promedio." },
  { id: "tv", etq: "Televisión LED 43″", icono: "fa-tv", cuarto: "sala", w: 80, horas: 5, hMax: 12, paso: 0.5, espera: 0.5, nota: "Apagada con el control sigue esperando la señal: modo espera." },
  { id: "deco", etq: "Decodificador de TV de paga", icono: "fa-satellite-dish", cuarto: "sala", w: 15, horas: 5, hMax: 12, paso: 0.5, espera: 12, nota: "El gran «vampiro»: apagado gasta casi lo mismo que encendido." },
  { id: "consola", etq: "Consola de videojuegos", icono: "fa-gamepad", cuarto: "sala", w: 150, horas: 2, hMax: 8, paso: 0.5, espera: 10, nota: "El «encendido rápido» la deja en espera consumiendo todo el día." },
  { id: "modem", etq: "Módem de internet", icono: "fa-wifi", cuarto: "sala", w: 10, horas: 24, hMax: 24, paso: 1, espera: 0, continuo: true, nota: "Encendido las 24 horas." },
  { id: "micro", etq: "Horno de microondas", icono: "fa-bowl-food", cuarto: "cocina", w: 1200, horas: 0.25, hMax: 2, paso: 0.25, espera: 2, nota: "Mucha potencia pero poco tiempo; el reloj consume todo el día." },
  { id: "lavadora", etq: "Lavadora automática", icono: "fa-soap", cuarto: "lavado", w: 500, horas: 0.5, hMax: 3, paso: 0.25, espera: 1, nota: "Tres o cuatro cargas a la semana ≈ media hora al día en promedio." },
  { id: "plancha", etq: "Plancha", icono: "fa-shirt", cuarto: "lavado", w: 1000, horas: 0.25, hMax: 2, paso: 0.25, espera: 0, nota: "Una resistencia que convierte toda la electricidad en calor." },
  { id: "bomba", etq: "Bomba del tinaco (½ hp)", icono: "fa-faucet-drip", cuarto: "lavado", w: 373, horas: 0.5, hMax: 3, paso: 0.25, espera: 0, nota: "Sube el agua de la cisterna al tinaco." },
  { id: "ventilador", etq: "Ventilador de pedestal", icono: "fa-fan", cuarto: "recamara", w: 60, horas: 6, hMax: 12, paso: 0.5, espera: 0, nota: "Mueve el aire; no enfría la habitación." },
  { id: "laptop", etq: "Computadora portátil", icono: "fa-laptop", cuarto: "recamara", w: 50, horas: 4, hMax: 12, paso: 0.5, espera: 0.5, nota: "El cargador conectado sin la computadora también consume." },
];

export interface EstadoCasa {
  uso: Record<AparatoId, boolean>;
  horas: Record<AparatoId, number>;
  foco: FocoId;
  refri: RefriId;
  /** Regleta apagada: lo que no se usa queda desconectado (sin modo espera). */
  desconectar: boolean;
}

export const N_FOCOS = 8;

export function estadoCasaInicial(): EstadoCasa {
  const uso = {} as Record<AparatoId, boolean>;
  const horas = {} as Record<AparatoId, number>;
  APARATOS.forEach((a) => {
    uso[a.id] = true;
    horas[a.id] = a.horas;
  });
  return { uso, horas, foco: "incandescente", refri: "antiguo", desconectar: false };
}

export function potenciaUso(a: AparatoDef, e: EstadoCasa): number {
  if (a.id === "focos") return N_FOCOS * FOCOS.find((f) => f.id === e.foco)!.w;
  if (a.id === "refri") return REFRIS.find((r) => r.id === e.refri)!.wMedia;
  return a.w;
}

export interface ConsumoAparato {
  id: AparatoId;
  /** kWh al día usándolo. */
  usoKwhDia: number;
  /** kWh al día en modo espera (fantasma). */
  esperaKwhDia: number;
  kwhDia: number;
  kwhBim: number;
  wUso: number;
  horasUso: number;
  horasEspera: number;
}

export function consumoAparato(a: AparatoDef, e: EstadoCasa): ConsumoAparato {
  const wUso = potenciaUso(a, e);
  const horasUso = a.continuo ? 24 : e.uso[a.id] ? e.horas[a.id] : 0;
  const horasEspera = a.espera > 0 && !e.desconectar ? 24 - horasUso : 0;
  const usoKwhDia = (wUso * horasUso) / 1000;
  const esperaKwhDia = (a.espera * horasEspera) / 1000;
  const kwhDia = usoKwhDia + esperaKwhDia;
  return { id: a.id, usoKwhDia, esperaKwhDia, kwhDia, kwhBim: kwhDia * DIAS_BIMESTRE, wUso, horasUso, horasEspera };
}

export interface ResumenCasa {
  aparatos: ConsumoAparato[];
  kwhDia: number;
  kwhBim: number;
  fantasmaBim: number;
  recibo: Recibo;
  co2Bim: number;
  co2Anio: number;
  mayor: AparatoId;
  /** Potencia media de la casa (W) = energía diaria / 24 h. */
  wMedia: number;
}

export function resumenCasa(e: EstadoCasa): ResumenCasa {
  const aparatos = APARATOS.map((a) => consumoAparato(a, e));
  const kwhDia = aparatos.reduce((s, c) => s + c.kwhDia, 0);
  const kwhBim = kwhDia * DIAS_BIMESTRE;
  const fantasmaBim = aparatos.reduce((s, c) => s + c.esperaKwhDia, 0) * DIAS_BIMESTRE;
  const mayor = aparatos.reduce((m, c) => (c.kwhDia > m.kwhDia ? c : m), aparatos[0]!).id;
  return { aparatos, kwhDia, kwhBim, fantasmaBim, recibo: recibo(kwhBim), co2Bim: kwhBim * FE_SEN, co2Anio: kwhBim * 6 * FE_SEN, mayor, wMedia: (kwhDia * 1000) / 24 };
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. DE LA PLANTA AL FOCO
 * ════════════════════════════════════════════════════════════════════════ */

export type PlantaId = "carbon" | "combustoleo" | "ciclo" | "solar";

export interface PlantaDef {
  id: PlantaId;
  etq: string;
  corto: string;
  /** Eficiencia de conversión a electricidad (fracción de la energía que entra). */
  eta: number;
  /** kg de CO₂ por GJ de energía que entra (IPCC 2006); 0 = sin emisiones directas. */
  feGJ: number;
  entrada: string;
  /** Poder calorífico (MJ por unidad) para expresar la energía de entrada en unidades de combustible. */
  pc: number;
  unidad: string;
  color: string;
  nota: string;
}

export const PLANTAS: PlantaDef[] = [
  { id: "carbon", etq: "Carboeléctrica", corto: "carbón", eta: 0.36, feGJ: 94.6, entrada: "carbón", pc: 25, unidad: "kg de carbón", color: "#475569", nota: "Quema carbón para hacer vapor que mueve una turbina (como Petacalco, Guerrero). Casi dos terceras partes de la energía se van como calor por la torre y la chimenea." },
  { id: "combustoleo", etq: "Termoeléctrica de combustóleo", corto: "combustóleo", eta: 0.35, feGJ: 77.4, entrada: "combustóleo", pc: 40, unidad: "L de combustóleo", color: "#b45309", nota: "Quema combustóleo, un residuo pesado del petróleo (como Tula, Hidalgo). Tan poco eficiente como el carbón y además contamina con azufre." },
  { id: "ciclo", etq: "Ciclo combinado (gas natural)", corto: "gas natural", eta: 0.55, feGJ: 56.1, entrada: "gas natural", pc: 38, unidad: "m³ de gas natural", color: "#38bdf8", nota: "Una turbina de gas y otra de vapor aprovechan dos veces el mismo calor: es la tecnología que más electricidad genera en México." },
  { id: "solar", etq: "Parque solar fotovoltaico", corto: "sol", eta: 0.2, feGJ: 0, entrada: "luz solar", pc: 0, unidad: "", color: "#facc15", nota: "Los paneles convierten cerca del 20 % de la luz del sol en electricidad sin quemar nada (como Villanueva, Coahuila). No emite CO₂ al generar, pero no produce de noche: la lectura A1 lo llama intermitencia." },
];

export interface Cadena {
  /** kWh al año que consumen los focos. */
  electricidadFoco: number;
  /** kWh que la planta debe generar para que lleguen esos kWh (pérdidas de red). */
  generada: number;
  perdidaRed: number;
  /** kWh de energía que entra a la planta (combustible o sol). */
  entrada: number;
  perdidaPlanta: number;
  luz: number;
  calorFoco: number;
  /** Fracción de la energía de entrada que termina como luz. */
  global: number;
  co2: number;
  /** Cantidad de combustible (en la unidad de la planta); 0 en solar. */
  combustible: number;
}

export function cadena(planta: PlantaDef, foco: FocoDef, nFocos: number, horasDia: number): Cadena {
  const electricidadFoco = (nFocos * foco.w * horasDia * 365) / 1000;
  const generada = electricidadFoco / (1 - PERDIDAS_RED);
  const entrada = generada / planta.eta;
  const gj = entrada * 0.0036;
  const luz = electricidadFoco * fraccionLuz(foco);
  return {
    electricidadFoco,
    generada,
    perdidaRed: generada - electricidadFoco,
    entrada,
    perdidaPlanta: entrada - generada,
    luz,
    calorFoco: electricidadFoco - luz,
    global: planta.eta * (1 - PERDIDAS_RED) * fraccionLuz(foco),
    co2: gj * planta.feGJ,
    combustible: planta.pc > 0 ? (gj * 1000) / planta.pc : 0,
  };
}

/** Energía de entrada por lumen respecto a la peor combinación (carbón + incandescente). */
export function vecesMenosCombustible(planta: PlantaDef, foco: FocoDef): number {
  const peor = FOCOS[0]!.w / PLANTAS[0]!.eta;
  return peor / (foco.w / planta.eta);
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. MI HUELLA DE CARBONO
 * ════════════════════════════════════════════════════════════════════════ */

export type TransporteId = "auto" | "compartido" | "moto" | "camion" | "metro" | "bici";
export type CalentadorId = "boiler" | "solar";
export type BienesId = "bajo" | "medio" | "alto";
export type CategoriaId = "transporte" | "alimentacion" | "hogar" | "bienes";

/** kg CO₂e por pasajero-kilómetro (estimaciones; auto: 2.3 kg CO₂ por litro de gasolina a 12 km/L). */
export const TRANSPORTES: { id: TransporteId; etq: string; icono: string; kgKm: number; nota: string }[] = [
  { id: "auto", etq: "Auto de gasolina (solo tú)", icono: "fa-car-side", kgKm: 0.19, nota: "Un litro de gasolina libera ≈ 2.3 kg de CO₂; a 12 km/L son 0.19 kg por kilómetro." },
  { id: "compartido", etq: "Auto compartido (3 personas)", icono: "fa-car", kgKm: 0.064, nota: "El mismo auto, dividido entre tres." },
  { id: "moto", etq: "Motocicleta", icono: "fa-motorcycle", kgKm: 0.066, nota: "Unos 35 km por litro." },
  { id: "camion", etq: "Camión o microbús", icono: "fa-bus", kgKm: 0.08, nota: "Muchas personas comparten un motor diésel o de gas." },
  { id: "metro", etq: "Metro o tren ligero", icono: "fa-train-subway", kgKm: 0.04, nota: "Eléctrico: sus emisiones dependen de cómo se genera la electricidad." },
  { id: "bici", etq: "Bicicleta o caminando", icono: "fa-person-biking", kgKm: 0, nota: "Sin emisiones directas." },
];

/** kg CO₂e por kg de alimento (medianas, Poore y Nemecek 2018). Porción = 120 g. */
export const KG_PORCION = 0.12;
export const FE_RES = 60;
export const FE_POLLO_CERDO = 6.5;
/** Resto de la dieta (tortilla, frijol, verduras, lácteos…): ilustrativo. */
export const BASE_DIETA_T = 0.8;
/** Gas LP: ≈ 3.0 kg de CO₂ por kg quemado (IPCC 2006). */
export const FE_GAS_LP = 3.0;
export const GAS_ESTUFA_KG_MES = 8;
export const CALENTADORES: { id: CalentadorId; etq: string; kgMes: number; nota: string }[] = [
  { id: "boiler", etq: "Calentador de gas LP (bóiler)", kgMes: 15, nota: "Calentar agua para bañarse es el mayor uso de gas de una casa." },
  { id: "solar", etq: "Calentador solar", kgMes: 4, nota: "El sol calienta el agua; el gas solo respalda los días nublados." },
];
export const BIENES: { id: BienesId; etq: string; t: number }[] = [
  { id: "bajo", etq: "Compro poco y reparo", t: 0.2 },
  { id: "medio", etq: "Compras normales", t: 0.4 },
  { id: "alto", etq: "Estreno ropa y aparatos seguido", t: 0.9 },
];

export const CATEGORIAS: { id: CategoriaId; etq: string; icono: string; color: string; a1: number }[] = [
  { id: "transporte", etq: "Transporte", icono: "fa-car-side", color: "#f87171", a1: 50 },
  { id: "alimentacion", etq: "Alimentación", icono: "fa-drumstick-bite", color: "#fbbf24", a1: 25 },
  { id: "hogar", etq: "Hogar", icono: "fa-house", color: "#38bdf8", a1: 20 },
  { id: "bienes", etq: "Bienes", icono: "fa-bag-shopping", color: "#c084fc", a1: 5 },
];

export interface EstadoHuella {
  transporte: TransporteId;
  km: number;
  res: number;
  polloCerdo: number;
  calentador: CalentadorId;
  habitantes: number;
  bienes: BienesId;
}

export const HUELLA_INICIAL: EstadoHuella = { transporte: "auto", km: 30, res: 2, polloCerdo: 5, calentador: "boiler", habitantes: 4, bienes: "medio" };

/** Toneladas de CO₂e al año por categoría. `kwhBimCasa` viene del modo «Mi casa». */
export function huella(h: EstadoHuella, kwhBimCasa: number): Record<CategoriaId, number> {
  const tr = TRANSPORTES.find((x) => x.id === h.transporte)!;
  const cal = CALENTADORES.find((x) => x.id === h.calentador)!;
  const transporte = (tr.kgKm * h.km * 365) / 1000;
  const alimentacion = BASE_DIETA_T + (KG_PORCION * 52 * (h.res * FE_RES + h.polloCerdo * FE_POLLO_CERDO)) / 1000;
  const electricidad = (kwhBimCasa * 6 * FE_SEN) / 1000;
  const gas = ((GAS_ESTUFA_KG_MES + cal.kgMes) * 12 * FE_GAS_LP) / 1000;
  const hogar = (electricidad + gas) / h.habitantes;
  const bienes = BIENES.find((x) => x.id === h.bienes)!.t;
  return { transporte, alimentacion, hogar, bienes };
}

export const totalHuella = (r: Record<CategoriaId, number>) => r.transporte + r.alimentacion + r.hogar + r.bienes;

/** Densidad del CO₂ a 15 °C y 1 atm (gas ideal): ρ = P·M/(R·T). */
export const RHO_CO2 = (101325 * 0.04401) / (8.314 * 288.15);
/** Diámetro (m) de una esfera que contiene `t` toneladas de CO₂ a 15 °C y 1 atm. */
export const diametroEsfera = (t: number) => Math.cbrt((6 * ((t * 1000) / RHO_CO2)) / Math.PI);

/** Emisiones de México 2022 (lectura A1) ÷ población (≈ 129 millones): promedio por habitante de todo el país. */
export const EMISIONES_MX_MT = 748;
export const POBLACION_MX_M = 129;
export const PER_CAPITA_MX = EMISIONES_MX_MT / POBLACION_MX_M;

/* ════════════════════════════════════════════════════════════════════════
 * Tarjeta de estrellas: ¿qué gasta más al día?
 * ════════════════════════════════════════════════════════════════════════ */

export interface UsoAparato {
  etq: string;
  w: number;
  /** minutos al día */
  min: number;
}
export interface Duelo {
  a: UsoAparato;
  b: UsoAparato;
}

export const kwhUso = (u: UsoAparato) => (u.w * u.min) / 60 / 1000;

export const DUELOS: Duelo[] = [
  { a: { etq: "Microondas de 1200 W, 10 min", w: 1200, min: 10 }, b: { etq: "Refrigerador eficiente de 38 W (media), todo el día", w: 38, min: 1440 } },
  { a: { etq: "Decodificador en espera de 12 W, 20 h", w: 12, min: 1200 }, b: { etq: "Plancha de 1000 W, 10 min", w: 1000, min: 10 } },
  { a: { etq: "Secadora de pelo de 1600 W, 10 min", w: 1600, min: 10 }, b: { etq: "Televisión de 80 W, 5 h", w: 80, min: 300 } },
  { a: { etq: "Laptop de 40 W, 4 h", w: 40, min: 240 }, b: { etq: "Consola en espera de 10 W, 22 h", w: 10, min: 1320 } },
  { a: { etq: "Ventilador de 60 W, 8 h", w: 60, min: 480 }, b: { etq: "Microondas de 1200 W, 20 min", w: 1200, min: 20 } },
  { a: { etq: "Bomba del tinaco de 373 W, 30 min", w: 373, min: 30 }, b: { etq: "Módem de 10 W, 24 h", w: 10, min: 1440 } },
  { a: { etq: "Lavadora de 500 W, 1 h", w: 500, min: 60 }, b: { etq: "8 focos LED de 9 W, 5 h", w: 72, min: 300 } },
  { a: { etq: "Hervidor eléctrico de 1500 W, 10 min", w: 1500, min: 10 }, b: { etq: "Cargador de celular de 5 W, 3 h", w: 5, min: 180 } },
  { a: { etq: "Foco incandescente de 60 W, 5 h", w: 60, min: 300 }, b: { etq: "Foco LED de 9 W, 5 h", w: 9, min: 300 } },
  { a: { etq: "Refrigerador antiguo de 70 W (media), todo el día", w: 70, min: 1440 }, b: { etq: "Aire acondicionado de 1100 W, 6 h", w: 1100, min: 360 } },
];

export const N_RONDA = 6;

export function mulberry32(semilla: number) {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ronda de duelos: índices barajados y, al azar, cuál va a la izquierda. */
export function rondaDuelos(rnd: () => number): { idx: number; invertir: boolean }[] {
  const ids = DUELOS.map((_, i) => i);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  }
  return ids.slice(0, N_RONDA).map((idx) => ({ idx, invertir: rnd() < 0.5 }));
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM de la plataforma
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "Consumo energético e impacto ambiental";

/** Lectura A1 — verbatim (6 párrafos). */
export const LECTURA_A1: string[] = [
  "Cada vez que usamos energía —encendemos una luz, usamos el transporte, cocinamos o compramos un producto manufacturado— generamos una emisión de gases de efecto invernadero que contribuye al cambio climático. La huella de carbono es la medida de esa emisión: se expresa en kilogramos o toneladas de CO2 equivalente (CO2e) y permite comparar el impacto climático de actividades muy distintas.",
  "México emitió aproximadamente 748 millones de toneladas de CO2 equivalente en 2022 (INECC), lo que lo ubica en el puesto 12 de los países con mayores emisiones absolutas a nivel global. Sin embargo, las emisiones per cápita mexicanas son significativamente menores que las de países como Estados Unidos o Canadá, lo que introduce una dimensión de justicia climática: los países que más han emitido históricamente no son necesariamente los más vulnerables a sus consecuencias.",
  "El mix energético de México sigue siendo mayoritariamente fósil: según la SENER, en 2023 aproximadamente el 76% de la energía primaria provenía de combustibles fósiles (gas natural, petróleo y carbón). La transición hacia energías renovables está contemplada en el PRODESEN 2024-2038 (Programa de Desarrollo del Sistema Eléctrico Nacional), que proyecta aumentar la participación de fuentes limpias, aunque los ritmos de implementación han sido objeto de debate político y técnico.",
  "Las energías renovables —solar, eólica, hidroeléctrica, geotérmica— tienen la ventaja de no emitir CO2 durante la generación, pero presentan el desafío de la intermitencia: el sol no brilla de noche y el viento no sopla siempre. El almacenamiento de energía mediante baterías de gran escala es la solución técnica en desarrollo, pero todavía es costosa y su producción misma tiene una huella ambiental considerable.",
  "A escala personal, la huella de carbono se distribuye aproximadamente así: el transporte representa cerca del 50% de las emisiones individuales (especialmente si se usa automóvil particular con combustión interna), la alimentación el 25% (la producción de carne de res es particularmente intensiva en emisiones), el hogar el 20% (climatización, electrodomésticos, calentadores de agua) y el consumo de bienes manufacturados el 5% restante. Conocer esta distribución permite identificar dónde pequeños cambios de comportamiento tienen mayor impacto.",
  "El INECC pone a disposición del público calculadoras de huella de carbono en línea que permiten estimar las emisiones personales y comparar alternativas. Reducir la huella de carbono no requiere sacrificar bienestar, sino hacer elecciones informadas: transporte público vs. auto, dieta con menos carne roja, electrodomésticos eficientes y energía renovable cuando se tiene la opción.",
];

/** Recuadro «importante» de la lectura A1 — verbatim. */
export const RECUADRO_A1 =
  "La justicia climática es un concepto central en los debates sobre cambio climático: los países más pobres, que han emitido históricamente menos gases de efecto invernadero, son frecuentemente los más vulnerables a sus efectos (sequías, inundaciones, pérdida de cosechas). México se considera un país de alta vulnerabilidad climática a pesar de no ser un gran emisor per cápita.";

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS: string[] = [
  "¿Qué es la huella de carbono y por qué se mide en CO2 equivalente y no solo en CO2?",
  "¿Cuál es el principal desafío de las energías renovables y cómo se busca resolverlo?",
  "¿En qué área de la vida cotidiana se concentra la mayor parte de la huella de carbono personal y qué cambio tendría más impacto?",
];

/** Hechos: quiz A4 (verdadero/falso), cada enunciado con su retroalimentación verbatim. */
export const HECHOS: string[] = [
  "Verdadero: «El consumo excesivo de energía puede tener impactos negativos en el ambiente». Correcto: por ejemplo, contaminación y emisiones de gases.",
  "Verdadero: «La eficiencia energética busca obtener el mismo servicio usando menos energía». Correcto: ahorra recursos y reduce impactos.",
  "Verdadero: «La sustentabilidad implica satisfacer nuestras necesidades sin comprometer a las generaciones futuras». Correcto: esa es la idea de desarrollo sustentable.",
  "Falso: «Apagar aparatos que no usamos no tiene ningún efecto en el consumo de energía». Falso: pequeños hábitos reducen el consumo total.",
];

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Consumo energético", definicion: "Cantidad de energía que usan las personas, hogares, industrias o países.", ejemplo: "El consumo eléctrico que aparece en tu recibo de luz." },
  { termino: "Eficiencia energética", definicion: "Lograr el mismo resultado utilizando menos energía.", ejemplo: "Un foco LED ilumina igual gastando menos electricidad." },
  { termino: "Impacto ambiental", definicion: "Efecto que producen las actividades humanas sobre el ambiente.", ejemplo: "La contaminación por quemar combustibles fósiles." },
  { termino: "Sustentabilidad", definicion: "Uso de los recursos que satisface el presente sin comprometer el futuro.", ejemplo: "Aprovechar energías limpias y ahorrar recursos." },
];

export const ACTIVIDAD_A5 = "Anota tres hábitos para reducir el consumo de energía en tu hogar.";

/** Debate A3 — verbatim (tema, posturas y reglas). */
export const DEBATE_A3 = {
  tema: "¿Quiénes son los principales responsables del cambio climático y quiénes deben liderar la solución?",
  posturas: [
    "Las grandes corporaciones y los países industrializados son los responsables principales y deben actuar primero",
    "La responsabilidad es individual y compartida: cada persona debe cambiar sus hábitos para lograr la transición",
  ],
  reglas: ["Apoya argumentos con datos concretos (emisiones, países, empresas)", "No desestimes la postura contraria sin argumentar", "Concluye reconociendo lo válido de la otra postura"],
};

/** Autoevaluación A7 — reflexión final verbatim. */
export const REFLEXION_A7 = "¿Qué hábito vas a cambiar para ahorrar energía en tu vida diaria?";

export const FUENTE =
  "CEN Bachillerato — UAC Ciencias Naturales, Experimentales y Tecnología II, progresión 10: lectura A1, quiz A2, debate A3, quiz A4, glosario A5, actividad A6 y autoevaluación A7.";

export const PROBLEMA =
  "El recibo de luz llega cada dos meses, pero casi nadie sabe qué aparato lo hace subir, cuánto se pierde antes de que la electricidad llegue a casa ni cuánto CO₂ hay detrás. En este laboratorio enciendes y apagas los aparatos de una casa, sigues la energía desde la planta hasta el foco y ves tu huella de carbono de un año convertida en globos de CO₂ a tamaño real.";

export const INSTRUCCIONES: string[] = [
  "En Mi casa y el recibo, toca un aparato (en la lista o en la casa), cambia sus horas o déjalo sin usar, y mira los kWh del bimestre, el recibo escalonado y el CO₂.",
  "Prueba la eficiencia: cambia los focos a LED, el refrigerador por uno eficiente y apaga la regleta para eliminar el consumo fantasma.",
  "En De la planta al foco, elige la planta y el foco y sigue las partículas de energía: cada una que se desvía es calor perdido.",
  "En Mi huella de carbono, ajusta cómo te mueves, qué comes y tu casa; compara tus globos de CO₂ con la distribución de la lectura A1.",
  "Gana estrellas en «¿Qué gasta más?» y resuelve el quiz A2 y el texto A6.",
];

export const IDEAS: string[] = [
  "La potencia (W) dice qué tan rápido gasta un aparato; la energía (kWh) es potencia por tiempo, y es lo que se cobra.",
  "Un aparato «apagado» pero enchufado puede seguir consumiendo: es el consumo fantasma o en espera.",
  "La tarifa doméstica es escalonada: pasar de 280 kWh al bimestre hace que cada kWh extra cueste casi el triple.",
  "Cada kWh que consumes en México equivale a unos 444 g de CO₂e (factor del SEN 2024).",
  "De la energía del carbón quemado, solo cerca de 1.7 % sale como luz de un foco incandescente; con ciclo combinado y LED, cerca de 17 %.",
  "Eficiencia energética es obtener el mismo servicio (la misma luz) con menos energía, menos dinero y menos emisiones.",
];

/** Quiz A2 «¿Qué sabemos sobre la huella de carbono?» — verbatim. */
export const QUIZ_A2: QuizEvaluable = {
  titulo: "¿Qué sabemos sobre la huella de carbono?",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Qué es la huella de carbono?",
      opciones: [
        "La sombra que proyecta un árbol de carbono",
        "La cantidad total de emisiones de gases de efecto invernadero generadas por una actividad, persona u organización",
        "El carbono que queda en el suelo después de un incendio",
        "La medida del carbono en los combustibles fósiles",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "La huella de carbono cuantifica las emisiones de CO₂ y otros GEI equivalentes generados por una actividad; se expresa en toneladas de CO₂ equivalente.",
    },
    {
      enunciado: "¿Por qué la quema de combustibles fósiles aumenta el efecto invernadero?",
      opciones: [
        "Porque consume el oxígeno del aire",
        "Porque libera CO₂ y otros gases atrapados durante millones de años que aumentan la concentración atmosférica de GEI",
        "Porque produce partículas que bloquean la luz solar",
        "Porque calienta el agua de los océanos directamente",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Los combustibles fósiles contienen carbono fijado hace millones de años; quemarlos libera ese carbono como CO₂, elevando su concentración y amplificando el efecto invernadero.",
    },
    {
      enunciado: "¿Cuál de estas acciones reduce más la huella de carbono de una persona en México?",
      opciones: ["Cambiar el color de paredes de casa", "Reducir el consumo de carne roja y usar transporte público o bicicleta", "Comprar ropa nueva de marcas sustentables", "Usar bolsas de tela en lugar de plástico ocasionalmente"],
      respuestaCorrecta: 1,
      retroalimentacion: "La dieta y el transporte son los factores de mayor impacto en la huella de carbono individual; reducir el consumo de carne y usar transporte limpio tiene mayor efecto.",
    },
    {
      enunciado: "La eficiencia energética consiste en:",
      opciones: [
        "Usar más energía para producir más bienes",
        "Obtener el mismo resultado (o mejor) con menor cantidad de energía",
        "Reemplazar toda la energía fósil por renovable inmediatamente",
        "Reducir el consumo de energía eléctrica al mínimo posible",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "La eficiencia energética busca producir los mismos servicios con menos energía, reduciendo costos y emisiones sin sacrificar bienestar.",
    },
    {
      enunciado: "¿Qué es la 'transición energética'?",
      opciones: [
        "El proceso de reparar líneas eléctricas dañadas",
        "El cambio gradual de un sistema energético basado en combustibles fósiles a uno predominantemente renovable y limpio",
        "La reducción del consumo energético a niveles del siglo XIX",
        "El traslado de plantas generadoras de una ciudad a otra",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "La transición energética es el cambio sistémico hacia fuentes renovables, mayor eficiencia y descarbonización de la economía.",
    },
  ],
};

/** Completa el texto A6 — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "CNEYT-II-P06-A6 · Completa: consumo y sustentabilidad",
  instrucciones: "Completa con la palabra correcta.",
  partes: [
    "El ",
    " excesivo de energía genera impacto ambiental. La ",
    " energética busca obtener el mismo servicio con menos energía. La ",
    " permite satisfacer nuestras necesidades sin comprometer a las generaciones ",
    ".",
  ],
  huecos: [
    { respuesta: "consumo", alternativas: [], pista: "Cantidad de energía que usamos." },
    { respuesta: "eficiencia", alternativas: [], pista: "Mismo servicio con menos energía." },
    { respuesta: "sustentabilidad", alternativas: ["sostenibilidad"], pista: "Sin comprometer el futuro." },
    { respuesta: "futuras", alternativas: [], pista: "Las que vendrán después." },
  ],
};
