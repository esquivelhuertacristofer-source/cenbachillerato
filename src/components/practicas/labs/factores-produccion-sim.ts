/**
 * Modelo del SIMULADOR «Tortillería La Milpa» (lab «factores-produccion»).
 *
 * TODO es ficticio: la tortillería, sus precios, salarios y costos son valores
 * de SIMULACIÓN para aprender cómo se combinan los factores de producción; no
 * son cifras reales de ningún negocio ni de México.
 *
 * Modelo determinista y transparente (sin azar):
 *   capacidad de tierra   = kg de maíz × 1.5          (kg de tortilla posibles)
 *   capacidad de trabajo  = trabajadores × 10 kg/h × horas
 *   capacidad de capital  = máquinas × 14 kg/h × horas
 *   producción bruta      = la MENOR de las tres (el cuello de botella)
 *   producción neta       = bruta × (1 − merma por organización)
 *   si falta un factor (tierra, trabajo, capital, organización o tiempo)
 *   la producción es cero, pero los demás factores se siguen pagando.
 *   pagos: renta (tierra) · salario (trabajo) · interés (capital) ·
 *          ganancia (organización) = ingresos − todo lo anterior.
 */

export type FactorId = "tierra" | "trabajo" | "capital" | "organizacion" | "tiempo";

export interface Config {
  /** kg de maíz al día. */
  maiz: number;
  trab: number;
  maq: number;
  /** Nivel de organización: 0 ninguna · 1 libreta · 2 turnos y pedidos · 3 planeación completa. */
  org: number;
  /** Horas de operación al día. */
  horas: number;
}

export const CONFIG_INICIAL: Config = { maiz: 60, trab: 2, maq: 1, org: 1, horas: 8 };

export const LIMITES = {
  maiz: { min: 0, max: 160, paso: 10 },
  trab: { min: 0, max: 6, paso: 1 },
  maq: { min: 0, max: 3, paso: 1 },
  org: { min: 0, max: 3, paso: 1 },
  horas: { min: 0, max: 12, paso: 1 },
} as const;

export const KG_POR_KG_MAIZ = 1.5;
export const KG_H_TRABAJADOR = 10;
export const KG_H_MAQUINA = 14;
export const PRECIO_KG = 22;
export const DEMANDA_BARRIO = 160;
export const COSTO_KG_MAIZ = 10;
export const SALARIO_DIA = 250;
export const INTERES_MAQUINA = 110;
export const PRESUPUESTO = 2600;
export const DIAS_MES = 26;

export const ORG_NIVELES: { nivel: number; nombre: string; merma: number; costo: number }[] = [
  { nivel: 0, nombre: "Sin organización", merma: 1, costo: 0 },
  { nivel: 1, nombre: "Libreta de pedidos", merma: 0.2, costo: 0 },
  { nivel: 2, nombre: "Turnos y registro de pedidos", merma: 0.08, costo: 90 },
  { nivel: 3, nombre: "Planeación completa", merma: 0.03, costo: 220 },
];

export const FACTOR_PAGO: Record<Exclude<FactorId, "tiempo">, { pago: string; quien: string }> = {
  tierra: { pago: "Renta", quien: "el dueño del maíz y de la tierra" },
  trabajo: { pago: "Salario", quien: "quienes hacen las tortillas" },
  capital: { pago: "Interés", quien: "quien prestó para comprar las máquinas" },
  organizacion: { pago: "Ganancia", quien: "quien organiza y asume el riesgo" },
};

export const EXPLICA_FALTA: Record<FactorId, string> = {
  tierra: "Sin tierra ni materia prima (maíz) no hay con qué hacer la masa: las manos y las máquinas se quedan esperando.",
  trabajo: "Sin trabajo humano nadie amasa, vigila la máquina ni despacha: la maquinaria sola no produce.",
  capital: "Sin capital (máquinas y herramientas) no hay tortillería en serie: solo se podría hacer a mano y muy poco.",
  organizacion: "Sin organización nadie coordina compras, turnos ni pedidos: los factores existen pero no se combinan.",
  tiempo: "Sin tiempo de operación el proceso nunca arranca: producir toma horas.",
};

export const EXPLICA_CUELLO: Record<"tierra" | "trabajo" | "capital", string> = {
  tierra: "Te falta materia prima: los trabajadores y las máquinas podrían hacer más, pero no hay suficiente maíz.",
  trabajo: "Faltan manos: hay maíz y máquinas de sobra, pero no alcanzan a atenderlos.",
  capital: "Faltan máquinas: hay maíz y gente, pero la capacidad de las máquinas es la que manda.",
};

export interface Opciones {
  demanda?: number;
  interesMaq?: number;
}

export interface Resultado {
  faltan: FactorId[];
  sinFondos: boolean;
  detenida: boolean;
  cap: { tierra: number; trabajo: number; capital: number };
  cuello: "tierra" | "trabajo" | "capital" | null;
  bruta: number;
  merma: number;
  produccion: number;
  vendidas: number;
  excedente: number;
  ingresos: number;
  renta: number;
  salarios: number;
  interes: number;
  costoOrg: number;
  gasto: number;
  ganancia: number;
}

export function salariosDe(trab: number, horas: number): number {
  const normales = Math.min(horas, 8) / 8;
  const extra = (Math.max(0, horas - 8) / 8) * 1.5;
  return Math.round(trab * SALARIO_DIA * (normales + extra));
}

export function resolver(c: Config, o: Opciones = {}): Resultado {
  const demanda = o.demanda ?? DEMANDA_BARRIO;
  const interesMaq = o.interesMaq ?? INTERES_MAQUINA;
  const faltan: FactorId[] = [];
  if (c.maiz <= 0) faltan.push("tierra");
  if (c.trab <= 0) faltan.push("trabajo");
  if (c.maq <= 0) faltan.push("capital");
  if (c.org <= 0) faltan.push("organizacion");
  if (c.horas <= 0) faltan.push("tiempo");

  const cap = {
    tierra: c.maiz * KG_POR_KG_MAIZ,
    trabajo: c.trab * KG_H_TRABAJADOR * c.horas,
    capital: c.maq * KG_H_MAQUINA * c.horas,
  };
  const org = ORG_NIVELES[Math.max(0, Math.min(3, c.org))]!;
  const renta = c.maiz * COSTO_KG_MAIZ;
  const salarios = salariosDe(c.trab, c.horas);
  const interes = c.maq * interesMaq;
  const costoOrg = org.costo;
  const gasto = renta + salarios + interes + costoOrg;
  const sinFondos = gasto > PRESUPUESTO;

  const minima = Math.min(cap.tierra, cap.trabajo, cap.capital);
  const detenida = faltan.length > 0 || sinFondos;
  const bruta = detenida ? 0 : minima;
  let cuello: Resultado["cuello"] = null;
  if (!detenida) {
    cuello = cap.tierra <= cap.trabajo && cap.tierra <= cap.capital ? "tierra" : cap.trabajo <= cap.capital ? "trabajo" : "capital";
  }
  const produccion = detenida ? 0 : Math.round(bruta * (1 - org.merma) * 10) / 10;
  const vendidas = Math.min(produccion, demanda);
  const excedente = Math.round((produccion - vendidas) * 10) / 10;
  const ingresos = Math.round(vendidas * PRECIO_KG);
  return {
    faltan, sinFondos, detenida, cap, cuello, bruta: Math.round(bruta * 10) / 10, merma: org.merma,
    produccion, vendidas, excedente, ingresos, renta, salarios, interes, costoOrg, gasto,
    ganancia: ingresos - gasto,
  };
}

/* ── Formal o informal (mes de 26 días) ─────────────────────────────────── */

export type Estatus = "formal" | "informal";

export const ESTATUS: Record<Estatus, { titulo: string; icono: string; demanda: number; interesMaq: number; impuesto: number; imssDia: number; accidente: number; multa: number; nota: string }> = {
  formal: {
    titulo: "Formal",
    icono: "fa-building-columns",
    demanda: 200,
    interesMaq: 80,
    impuesto: 0.06,
    imssDia: 70,
    accidente: 0,
    multa: 0,
    nota: "Paga impuestos y seguro social, pero consigue crédito barato, factura a comedores y escuelas, y el IMSS cubre los accidentes.",
  },
  informal: {
    titulo: "Informal",
    icono: "fa-cart-shopping",
    demanda: DEMANDA_BARRIO,
    interesMaq: 150,
    impuesto: 0,
    imssDia: 0,
    accidente: 2400,
    multa: 3000,
    nota: "No paga impuestos ni cuotas, pero el crédito sale caro, solo vende en el barrio, y los accidentes y las multas los paga el dueño.",
  },
};

export interface Mes {
  dia: Resultado;
  ingresos: number;
  costos: number;
  impuestos: number;
  imss: number;
  accidente: number;
  multa: number;
  gananciaDia: number;
  ganancia: number;
}

export function mes(c: Config, e: Estatus): Mes {
  const k = ESTATUS[e];
  const dia = resolver(c, { demanda: k.demanda, interesMaq: k.interesMaq });
  const impuestos = Math.round(dia.ingresos * k.impuesto * DIAS_MES);
  const imss = c.trab * k.imssDia * DIAS_MES;
  const accidente = c.trab > 0 ? k.accidente : 0;
  const multa = k.multa;
  const ingresos = dia.ingresos * DIAS_MES;
  const costos = dia.gasto * DIAS_MES;
  const ganancia = ingresos - costos - impuestos - imss - accidente - multa;
  const gananciaDia = Math.round((dia.ingresos - dia.gasto) - (impuestos + imss) / DIAS_MES);
  return { dia, ingresos, costos, impuestos, imss, accidente, multa, gananciaDia, ganancia };
}

/* ── La cadena del tomate de Sinaloa (precio por kilo, simulación) ──────── */

export const CADENA_PRECIOS: Record<string, { quien: string; aporte: number; texto: string; color: string }> = {
  "cp-cultivo": { quien: "Agricultor", aporte: 9, texto: "Siembra, riega y cosecha: recibe $9 por kilo.", color: "#34D399" },
  "cp-intermediarios": { quien: "Intermediario", aporte: 5, texto: "Compra la cosecha completa y la revende: se queda $5 por kilo.", color: "#FFC75A" },
  "cp-transporte": { quien: "Transportista", aporte: 3, texto: "Traslada la carga a las ciudades: cobra $3 por kilo.", color: "#5BC8FF" },
  "cp-venta": { quien: "Comercio", aporte: 9, texto: "Exhibe y vende al público: se queda $9 por kilo.", color: "#C084FC" },
  "cp-mesa": { quien: "Familia", aporte: 0, texto: "Paga el precio completo; con ese pago se cierra el ciclo y se reparte entre todos los eslabones.", color: "#FF8A5B" },
};

export function precioFinal(): number {
  return Object.values(CADENA_PRECIOS).reduce((s, p) => s + p.aporte, 0);
}
