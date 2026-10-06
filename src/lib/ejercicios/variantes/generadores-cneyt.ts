/**
 * Generadores de variantes — Ciencias (CNEYT-I … CNEYT-VI).
 * Cada uno conserva la situación y el procedimiento del ejercicio original.
 */
import {
  definir, elegir, entero, multiplo, redondear, fmt, elegirVarios,
  type Definicion,
} from './motor';

// ── CNEYT-I-P02-A6 · Densidad de un metal ────────────────────────────────────
const METALES = [
  { nombre: 'aluminio', rho: 2.7 },
  { nombre: 'zinc', rho: 7.1 },
  { nombre: 'hierro', rho: 7.9 },
  { nombre: 'cobre', rho: 8.9 },
  { nombre: 'plata', rho: 10.5 },
  { nombre: 'plomo', rho: 11.3 },
] as const;
const TABLA_METALES = METALES.map((m) => `${m.nombre} ${fmt(m.rho)} g/cm³`).join(', ');

const densidadMetal = definir({
  original: { metal: 0, V: 100 },
  elegir: (rng) => ({ metal: entero(rng, 0, METALES.length - 1), V: elegir(rng, [20, 25, 40, 50, 60, 80, 120, 150, 200]) }),
  resolver: ({ metal, V }) => {
    const { nombre, rho } = METALES[metal]!;
    const m = redondear(rho * V, 1);
    const r = redondear(m / V, 2);
    return {
      problema: `Un objeto metálico tiene una masa de ${fmt(m)} g y un volumen de ${fmt(V)} cm³. Calcula su densidad. Compárala con estas densidades: ${TABLA_METALES}. ¿De qué metal podría tratarse?`,
      respuesta: r,
      unidades: 'g/cm³',
      tolerancia: 0.05,
      pasos: [
        'Aplica ρ = m / V.',
        `ρ = ${fmt(m)} g / ${fmt(V)} cm³.`,
        `ρ = ${fmt(r)} g/cm³, que coincide con la del ${nombre}.`,
      ],
      respuestaTexto: `${fmt(r)} g/cm³ (${nombre})`,
    };
  },
});

// ── CNEYT-I-P04-A6 · Porcentaje en masa ─────────────────────────────────────
const porcentajeMasa = definir({
  original: { s: 20, w: 80, soluto: 'sal' },
  elegir: (rng) => {
    for (let i = 0; i < 60; i++) {
      const D = elegir(rng, [50, 100, 125, 200, 250, 400, 500]);
      const p = elegir(rng, [2, 4, 5, 8, 10, 12, 15, 20, 25, 30, 40]);
      const s = (D * p) / 100;
      if (Number.isInteger(s)) return { s, w: D - s, soluto: elegir(rng, ['sal', 'azúcar', 'bicarbonato de sodio']) };
    }
    return { s: 10, w: 90, soluto: 'sal' };
  },
  resolver: ({ s, w, soluto }) => {
    const D = s + w;
    const p = redondear((s / D) * 100, 2);
    return {
      problema: `Disuelves ${fmt(s)} g de ${soluto} en ${fmt(w)} g de agua. ¿Cuál es la concentración de la disolución en porcentaje en masa (% m/m)?`,
      respuesta: p,
      unidades: '% m/m',
      tolerancia: 0.5,
      pasos: [
        `Masa de disolución = ${fmt(s)} g + ${fmt(w)} g = ${fmt(D)} g.`,
        `% m/m = (${fmt(s)} / ${fmt(D)}) × 100.`,
        `% m/m = ${fmt(p)} %.`,
      ],
      respuestaTexto: `${fmt(p)} % en masa`,
    };
  },
});

// ── CNEYT-I-P06-A6 · Conversión m → cm → mm ─────────────────────────────────
const conversionLongitud = definir({
  original: { L: 1.75, objeto: 'una mesa' },
  elegir: (rng) => ({
    L: multiplo(rng, 0.45, 3.2, 0.01),
    objeto: elegir(rng, ['una mesa', 'un pizarrón', 'una puerta', 'un escritorio', 'una banca del laboratorio']),
  }),
  resolver: ({ L, objeto }) => {
    const cm = redondear(L * 100, 2);
    const mm = redondear(L * 1000, 1);
    return {
      problema: `En un experimento mediste la longitud de ${objeto}: ${fmt(L)} m. Exprésala en centímetros (cm) y en milímetros (mm). En la casilla escribe el resultado en centímetros. Para calificar, escribe el valor en milímetros.`,
      respuesta: mm,
      unidades: 'mm',
      tolerancia: 0,
      pasos: [
        'Para pasar de m a cm, multiplica por 100.',
        'Para pasar de m a mm, multiplica por 1000.',
        `${fmt(L)} × 100 = ${fmt(cm)} cm; ${fmt(L)} × 1000 = ${fmt(mm)} mm.`,
      ],
      respuestaTexto: `${fmt(cm)} cm y ${fmt(mm)} mm`,
    };
  },
});

// ── CNEYT-II-P05-A2 · Trabajo y potencia ────────────────────────────────────
const trabajoPotencia = definir({
  original: { F: 80, d: 5, t: 2 },
  elegir: (rng) => {
    for (let i = 0; i < 60; i++) {
      const F = multiplo(rng, 40, 200, 10);
      const d = entero(rng, 2, 12);
      const t = elegir(rng, [2, 3, 4, 5, 8, 10]);
      if (Number.isInteger((F * d) / t)) return { F, d, t };
    }
    return { F: 100, d: 4, t: 2 };
  },
  resolver: ({ F, d, t }) => {
    const W = F * d;
    const P = redondear(W / t, 2);
    return {
      problema: `Una persona aplica una fuerza horizontal de ${fmt(F)} N para empujar una caja a lo largo de ${fmt(d)} metros sobre una superficie plana (el ángulo entre la fuerza y el desplazamiento es 0°). Después, un motor realiza ese mismo trabajo en tan solo ${fmt(t)} segundos. Calcula primero el trabajo de la persona y responde el inciso (b): ¿cuánta potencia desarrolla el motor?`,
      respuesta: P,
      unidades: 'W',
      tolerancia: 0,
      pasos: [
        `Parte (a): identifica F = ${fmt(F)} N, d = ${fmt(d)} m, θ = 0° → cos(0°) = 1.`,
        `Aplica W = F × d × cos θ = ${fmt(F)} × ${fmt(d)} × 1 = ${fmt(W)} J.`,
        `Parte (b): identifica W = ${fmt(W)} J, t = ${fmt(t)} s.`,
        `Aplica P = W / t = ${fmt(W)} J / ${fmt(t)} s = ${fmt(P)} W.`,
      ],
      respuestaTexto: `${fmt(P)} W`,
    };
  },
});

// ── CNEYT-II-P11-A2 · Conducción por una ventana (Fourier) ───────────────────
const conduccionVentana = definir({
  original: { A: 1.5, Lmm: 6, Tin: 22, Tout: 4 },
  elegir: (rng) => {
    for (let i = 0; i < 80; i++) {
      const A = elegir(rng, [0.8, 1, 1.2, 1.5, 2, 2.4]);
      const Lmm = elegir(rng, [4, 5, 6, 8]);
      const Tin = entero(rng, 18, 24);
      const Tout = entero(rng, -2, 12);
      const q = (0.8 * A * (Tin - Tout)) / (Lmm / 1000);
      if (Math.abs(q - Math.round(q)) < 1e-6) return { A, Lmm, Tin, Tout };
    }
    return { A: 1, Lmm: 5, Tin: 20, Tout: 5 };
  },
  resolver: ({ A, Lmm, Tin, Tout }) => {
    const L = Lmm / 1000;
    const dT = Tin - Tout;
    const num = redondear(0.8 * A * dT, 4);
    const q = redondear(num / L, 1);
    return {
      problema: `CONDUCCIÓN (inciso a). Una ventana de vidrio de A = ${fmt(A)} m² y L = ${fmt(Lmm)} mm (${fmt(L)} m) separa un interior a ${fmt(Tin)} °C de un exterior a ${fmt(Tout)} °C. Si la conductividad térmica del vidrio es k = 0.8 W/m·K, ¿cuánto calor por segundo (Q/t, en watts) se pierde por conducción?`,
      respuesta: q,
      unidades: 'W',
      tolerancia: Math.max(1, redondear(q * 0.005, 0)),
      pasos: [
        'Usa la ley de Fourier: Q/t = k·A·ΔT / L.',
        `ΔT = ${fmt(Tin)} − (${fmt(Tout)}) = ${fmt(dT)} °C.`,
        `Q/t = (0.8 × ${fmt(A)} × ${fmt(dT)}) / ${fmt(L)} = ${fmt(num)} / ${fmt(L)} = ${fmt(q)} W.`,
      ],
      respuestaTexto: `${fmt(q)} W`,
    };
  },
});

// ── CNEYT-III-P02-A2 · Regla del 10 % ───────────────────────────────────────
const reglaDiezPorciento = definir({
  original: { E: 10000 },
  elegir: (rng) => ({ E: elegir(rng, [5000, 8000, 12000, 15000, 20000, 25000, 30000, 40000, 50000, 60000]) }),
  resolver: ({ E }) => {
    const n2 = redondear(E * 0.1, 2);
    const n3 = redondear(n2 * 0.1, 2);
    const n4 = redondear(n3 * 0.1, 2);
    return {
      problema: `En una pradera, los productores (pastos) fijan ${fmt(E)} kcal de energía solar mediante fotosíntesis. Aplicando la regla del 10 % de eficiencia ecológica (productores → consumidores primarios → secundarios → terciarios), responde el inciso (c): ¿cuánta energía estará disponible para los consumidores terciarios (águilas)?`,
      respuesta: n4,
      unidades: 'kcal',
      tolerancia: 0,
      pasos: [
        `Nivel 1 (productores): ${fmt(E)} kcal.`,
        `Nivel 2 (consumidores primarios): ${fmt(E)} × 0.10 = ${fmt(n2)} kcal.`,
        `Nivel 3 (consumidores secundarios): ${fmt(n2)} × 0.10 = ${fmt(n3)} kcal.`,
        `Nivel 4 (consumidores terciarios): ${fmt(n3)} × 0.10 = ${fmt(n4)} kcal, apenas el 0.1 % de la energía original.`,
      ],
      respuestaTexto: `${fmt(n4)} kcal`,
    };
  },
});

// ── CNEYT-III-P09-A2 · Conteo de átomos en una combustión balanceada ─────────
interface Especie { coef: number; f: string; at: Record<string, number> }
interface Combustion { nombre: string; r: Especie[]; p: Especie[] }
const COMBUSTIONES: Combustion[] = [
  {
    nombre: 'la combustión del metano (el gas de muchas estufas)',
    r: [{ coef: 1, f: 'CH₄', at: { C: 1, H: 4 } }, { coef: 2, f: 'O₂', at: { O: 2 } }],
    p: [{ coef: 1, f: 'CO₂', at: { C: 1, O: 2 } }, { coef: 2, f: 'H₂O', at: { H: 2, O: 1 } }],
  },
  {
    nombre: 'la combustión del propano (el gas LP de los cilindros)',
    r: [{ coef: 1, f: 'C₃H₈', at: { C: 3, H: 8 } }, { coef: 5, f: 'O₂', at: { O: 2 } }],
    p: [{ coef: 3, f: 'CO₂', at: { C: 1, O: 2 } }, { coef: 4, f: 'H₂O', at: { H: 2, O: 1 } }],
  },
  {
    nombre: 'la combustión del butano (el gas de los encendedores)',
    r: [{ coef: 2, f: 'C₄H₁₀', at: { C: 4, H: 10 } }, { coef: 13, f: 'O₂', at: { O: 2 } }],
    p: [{ coef: 8, f: 'CO₂', at: { C: 1, O: 2 } }, { coef: 10, f: 'H₂O', at: { H: 2, O: 1 } }],
  },
  {
    nombre: 'la combustión del etano',
    r: [{ coef: 2, f: 'C₂H₆', at: { C: 2, H: 6 } }, { coef: 7, f: 'O₂', at: { O: 2 } }],
    p: [{ coef: 4, f: 'CO₂', at: { C: 1, O: 2 } }, { coef: 6, f: 'H₂O', at: { H: 2, O: 1 } }],
  },
  {
    nombre: 'la combustión del etanol (el alcohol de los mecheros)',
    r: [{ coef: 1, f: 'C₂H₅OH', at: { C: 2, H: 6, O: 1 } }, { coef: 3, f: 'O₂', at: { O: 2 } }],
    p: [{ coef: 2, f: 'CO₂', at: { C: 1, O: 2 } }, { coef: 3, f: 'H₂O', at: { H: 2, O: 1 } }],
  },
];
const conCoef = (e: Especie) => `${e.coef > 1 ? `${e.coef} ` : ''}${e.f}`;
const ecuacion = (c: Combustion) => `${c.r.map(conCoef).join(' + ')} → ${c.p.map(conCoef).join(' + ')}`;
function contar(lado: Especie[], el: string): { total: number; detalle: string } {
  const partes = lado.filter((e) => e.at[el]).map((e) => ({ e, n: e.coef * e.at[el]! }));
  return {
    total: partes.reduce((s, x) => s + x.n, 0),
    detalle: partes.map(({ e, n }) => `${e.coef} × ${e.at[el]} (de ${conCoef(e)}) = ${n}`).join('; '),
  };
}

const conteoAtomos = definir({
  original: { i: 0, el: 'O', lado: 'p' as 'r' | 'p' },
  elegir: (rng) => ({ i: entero(rng, 0, COMBUSTIONES.length - 1), el: elegir(rng, ['C', 'H', 'O']), lado: elegir(rng, ['r', 'p'] as const) }),
  resolver: ({ i, el, lado }) => {
    const c = COMBUSTIONES[i]!;
    const r = contar(c.r, el);
    const p = contar(c.p, el);
    const nombreEl = { C: 'carbono (C)', H: 'hidrógeno (H)', O: 'oxígeno (O)' }[el] ?? el;
    const ladoTxt = lado === 'r' ? 'los reactivos' : 'los productos';
    const total = lado === 'r' ? r.total : p.total;
    return {
      problema: `Trabaja con ${c.nombre}: ${ecuacion(c)}. CONTEO DE ÁTOMOS (inciso c): ¿cuántos átomos de ${nombreEl} hay en ${ladoTxt}? Multiplica coeficiente × subíndice.`,
      respuesta: total,
      unidades: 'átomos',
      tolerancia: 0,
      pasos: [
        'El coeficiente (número grande delante) indica cuántas moléculas hay; el subíndice, cuántos átomos de ese elemento tiene cada molécula.',
        `Reactivos: ${r.detalle} → ${el} = ${r.total}.`,
        `Productos: ${p.detalle} → ${el} = ${p.total}.`,
        `En ${ladoTxt} hay ${fmt(total)} átomos de ${el}; como ${r.total} = ${p.total}, ese elemento se conserva (ley de Lavoisier).`,
      ],
      respuestaTexto: `${fmt(total)} átomos de ${el}`,
    };
  },
});

// ── CNEYT-III-P10-A2 · Densidad del agua en el ciclo del agua ────────────────
const SUSTANCIAS_AGUA = [
  { nombre: 'agua líquida', rho: 1.0 },
  { nombre: 'hielo', rho: 0.92 },
  { nombre: 'agua de mar', rho: 1.03 },
] as const;

const densidadAgua = definir({
  original: { s: 0, V: 500 },
  elegir: (rng) => ({ s: entero(rng, 0, SUSTANCIAS_AGUA.length - 1), V: multiplo(rng, 100, 1000, 100) }),
  resolver: ({ s, V }) => {
    const { nombre, rho } = SUSTANCIAS_AGUA[s]!;
    const m = redondear(rho * V, 1);
    const d = redondear(m / V, 2);
    const compara = d < 1 ? 'es menos densa que el agua líquida (1.0 g/cm³), así que flota' : d > 1 ? 'es más densa que el agua líquida (1.0 g/cm³)' : 'es la densidad típica del agua';
    return {
      problema: `DENSIDAD (inciso a). Una muestra de ${nombre} tiene una masa de ${fmt(m)} g y ocupa un volumen de ${fmt(V)} cm³. Calcula su densidad. (Fórmula: densidad = masa / volumen.)`,
      respuesta: d,
      unidades: 'g/cm³',
      tolerancia: 0.01,
      pasos: [
        'Usa densidad = masa / volumen.',
        `densidad = ${fmt(m)} g / ${fmt(V)} cm³.`,
        `densidad = ${fmt(d)} g/cm³: ${compara}.`,
      ],
      respuestaTexto: `${fmt(d)} g/cm³`,
    };
  },
});

// ── CNEYT-III-P11-A2 · Fotosíntesis: O₂ liberado ─────────────────────────────
const oxigenoFotosintesis = definir({
  original: { n: 1, gas: 'O₂' as 'O₂' | 'CO₂' },
  elegir: (rng) => ({ n: entero(rng, 2, 60), gas: elegir(rng, ['O₂', 'CO₂'] as const) }),
  resolver: ({ n, gas }) => {
    const total = 6 * n;
    const verbo = gas === 'O₂' ? 'se liberan' : 'se consumen';
    return {
      problema: `FOTOSÍNTESIS (inciso d). En la ecuación 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂, si unas cianobacterias producen ${fmt(n)} ${n === 1 ? 'molécula' : 'moléculas'} de glucosa, ¿cuántas moléculas de ${gas} ${verbo}?`,
      respuesta: total,
      unidades: `moléculas de ${gas}`,
      tolerancia: 0,
      pasos: [
        `Lee la ecuación: por cada molécula de glucosa (C₆H₁₂O₆) ${verbo} 6 moléculas de ${gas}.`,
        `La relación es 1 : 6, así que multiplica: ${fmt(n)} × 6.`,
        `${fmt(n)} × 6 = ${fmt(total)} moléculas de ${gas}.`,
      ],
      respuestaTexto: `${fmt(total)} moléculas de ${gas}`,
    };
  },
});

// ── CNEYT-IV-P01-A2 · Balanceo por tanteo ────────────────────────────────────
interface EcBalanceo { r: Especie[]; p: Especie[]; pista: string }
const ECUACIONES_BALANCEO: EcBalanceo[] = [
  {
    r: [{ coef: 2, f: 'H₂', at: { H: 2 } }, { coef: 1, f: 'O₂', at: { O: 2 } }],
    p: [{ coef: 2, f: 'H₂O', at: { H: 2, O: 1 } }],
    pista: 'Empareja el oxígeno con un 2 delante del H₂O y luego ajusta el hidrógeno con un 2 delante del H₂.',
  },
  {
    r: [{ coef: 1, f: 'CH₄', at: { C: 1, H: 4 } }, { coef: 2, f: 'O₂', at: { O: 2 } }],
    p: [{ coef: 1, f: 'CO₂', at: { C: 1, O: 2 } }, { coef: 2, f: 'H₂O', at: { H: 2, O: 1 } }],
    pista: 'Balancea primero el H (2 delante del H₂O); luego hay 4 O a la derecha, así que pon 2 delante del O₂.',
  },
  {
    r: [{ coef: 4, f: 'Fe', at: { Fe: 1 } }, { coef: 3, f: 'O₂', at: { O: 2 } }],
    p: [{ coef: 2, f: 'Fe₂O₃', at: { Fe: 2, O: 3 } }],
    pista: 'El mínimo común múltiplo de los O (2 y 3) es 6: pon 3 delante del O₂ y 2 delante del Fe₂O₃; después ajusta el Fe.',
  },
  {
    r: [{ coef: 4, f: 'Al', at: { Al: 1 } }, { coef: 3, f: 'O₂', at: { O: 2 } }],
    p: [{ coef: 2, f: 'Al₂O₃', at: { Al: 2, O: 3 } }],
    pista: 'Igual que con el hierro: el mcm de los O (2 y 3) es 6; pon 3 delante del O₂ y 2 delante del Al₂O₃; después ajusta el Al.',
  },
  {
    r: [{ coef: 1, f: 'N₂', at: { N: 2 } }, { coef: 3, f: 'H₂', at: { H: 2 } }],
    p: [{ coef: 2, f: 'NH₃', at: { N: 1, H: 3 } }],
    pista: 'Hay 2 N a la izquierda: pon 2 delante del NH₃; eso da 6 H a la derecha, así que pon 3 delante del H₂.',
  },
  {
    r: [{ coef: 2, f: 'Na', at: { Na: 1 } }, { coef: 1, f: 'Cl₂', at: { Cl: 2 } }],
    p: [{ coef: 2, f: 'NaCl', at: { Na: 1, Cl: 1 } }],
    pista: 'El Cl₂ aporta 2 átomos de cloro: pon 2 delante del NaCl y luego 2 delante del Na.',
  },
  {
    r: [{ coef: 2, f: 'Mg', at: { Mg: 1 } }, { coef: 1, f: 'O₂', at: { O: 2 } }],
    p: [{ coef: 2, f: 'MgO', at: { Mg: 1, O: 1 } }],
    pista: 'El O₂ aporta 2 átomos de oxígeno: pon 2 delante del MgO y luego 2 delante del Mg.',
  },
  {
    r: [{ coef: 1, f: 'C₃H₈', at: { C: 3, H: 8 } }, { coef: 5, f: 'O₂', at: { O: 2 } }],
    p: [{ coef: 3, f: 'CO₂', at: { C: 1, O: 2 } }, { coef: 4, f: 'H₂O', at: { H: 2, O: 1 } }],
    pista: 'Balancea C (3 delante del CO₂), luego H (4 delante del H₂O); a la derecha quedan 6 + 4 = 10 O, así que pon 5 delante del O₂.',
  },
  {
    r: [{ coef: 2, f: 'KClO₃', at: { K: 1, Cl: 1, O: 3 } }],
    p: [{ coef: 2, f: 'KCl', at: { K: 1, Cl: 1 } }, { coef: 3, f: 'O₂', at: { O: 2 } }],
    pista: 'El mcm de los O (3 y 2) es 6: pon 2 delante del KClO₃ y 3 delante del O₂; después ajusta el KCl.',
  },
  {
    r: [{ coef: 1, f: 'Zn', at: { Zn: 1 } }, { coef: 2, f: 'HCl', at: { H: 1, Cl: 1 } }],
    p: [{ coef: 1, f: 'ZnCl₂', at: { Zn: 1, Cl: 2 } }, { coef: 1, f: 'H₂', at: { H: 2 } }],
    pista: 'A la derecha hay 2 Cl y 2 H: pon 2 delante del HCl.',
  },
];
const sinCoef = (lado: Especie[]) => lado.map((e) => e.f).join(' + ');
const elementos = (ec: EcBalanceo) => [...new Set([...ec.r, ...ec.p].flatMap((e) => Object.keys(e.at)))];
const sumaLado = (lado: Especie[], el: string, usarCoef: boolean) =>
  lado.reduce((s, e) => s + (usarCoef ? e.coef : 1) * (e.at[el] ?? 0), 0);

const balanceo = definir({
  original: { i: 2, especie: 0 },
  elegir: (rng) => {
    const i = entero(rng, 0, ECUACIONES_BALANCEO.length - 1);
    const todas = [...ECUACIONES_BALANCEO[i]!.r, ...ECUACIONES_BALANCEO[i]!.p];
    const conCoefMayor = todas.map((e, k) => ({ e, k })).filter((x) => x.e.coef > 1);
    return { i, especie: elegir(rng, conCoefMayor).k };
  },
  resolver: ({ i, especie }) => {
    const ec = ECUACIONES_BALANCEO[i]!;
    const todas = [...ec.r, ...ec.p];
    const objetivo = todas[especie]!;
    const els = elementos(ec);
    const inicial = els.map((el) => `${el} ${sumaLado(ec.r, el, false)}/${sumaLado(ec.p, el, false)}`).join(', ');
    const final = els.map((el) => `${el} ${sumaLado(ec.r, el, true)} = ${sumaLado(ec.p, el, true)}`).join('; ');
    return {
      problema: `Balancea por inspección (tanteo) la ecuación ${sinCoef(ec.r)} → ${sinCoef(ec.p)}. Recuerda: SOLO puedes cambiar los coeficientes, nunca los subíndices. ¿Qué coeficiente lleva el ${objetivo.f}?`,
      respuesta: objetivo.coef,
      unidades: `coeficiente del ${objetivo.f}`,
      tolerancia: 0,
      pasos: [
        `Cuenta los átomos sin coeficientes (izquierda/derecha): ${inicial}.`,
        ec.pista,
        `Ecuación balanceada: ${ecuacion({ nombre: '', r: ec.r, p: ec.p })}. Verifica: ${final} ✓.`,
        `El coeficiente del ${objetivo.f} es ${fmt(objetivo.coef)}.`,
      ],
      respuestaTexto: `${fmt(objetivo.coef)} (${ecuacion({ nombre: '', r: ec.r, p: ec.p })})`,
    };
  },
});

// ── CNEYT-IV-P09-A2 · Potencial de una pila ─────────────────────────────────
const PARES_REDOX = [
  { par: 'Mg²⁺/Mg', metal: 'magnesio', E: -2.37 },
  { par: 'Al³⁺/Al', metal: 'aluminio', E: -1.66 },
  { par: 'Zn²⁺/Zn', metal: 'zinc', E: -0.76 },
  { par: 'Fe²⁺/Fe', metal: 'hierro', E: -0.44 },
  { par: 'Ni²⁺/Ni', metal: 'níquel', E: -0.25 },
  { par: 'Pb²⁺/Pb', metal: 'plomo', E: -0.13 },
  { par: 'Cu²⁺/Cu', metal: 'cobre', E: 0.34 },
  { par: 'Ag⁺/Ag', metal: 'plata', E: 0.8 },
] as const;
const signoV = (E: number) => `${E > 0 ? '+' : ''}${fmt(E, 2, 2)} V`;

const potencialPila = definir({
  original: { a: 2, b: 6 },
  elegir: (rng) => {
    const [a, b] = elegirVarios(rng, PARES_REDOX.map((_, i) => i), 2);
    return { a: a!, b: b! };
  },
  resolver: ({ a, b }) => {
    const A = PARES_REDOX[a]!;
    const B = PARES_REDOX[b]!;
    const [an, cat] = A.E < B.E ? [A, B] : [B, A];
    const E = redondear(cat.E - an.E, 2);
    return {
      problema: `PILA (inciso a). Se arma una pila con un electrodo de ${A.metal} en su disolución y uno de ${B.metal} en la suya. Datos: E°(${A.par}) = ${signoV(A.E)}; E°(${B.par}) = ${signoV(B.E)}. Indica cuál se oxida y cuál se reduce, y calcula el potencial estándar de la pila, E°pila = E°cátodo − E°ánodo.`,
      respuesta: E,
      unidades: 'V',
      tolerancia: 0.01,
      pasos: [
        `El ${cat.metal} tiene mayor E° (${signoV(cat.E)}): es el cátodo (se reduce). El ${an.metal}, con menor E° (${signoV(an.E)}), es el ánodo (se oxida).`,
        `E°pila = E°cátodo − E°ánodo = ${fmt(cat.E, 2, 2)} − (${fmt(an.E, 2, 2)}).`,
        `E°pila = +${fmt(E, 2, 2)} V (positivo: la pila es espontánea).`,
      ],
      respuestaTexto: `+${fmt(E, 2, 2)} V`,
    };
  },
});

// ── CNEYT-IV-P10-A2 · Cociente de reacción Q ────────────────────────────────
const cocienteQ = definir({
  original: { h2: 0.2, i2: 0.2, hi: 0.5 },
  elegir: (rng) => ({
    h2: elegir(rng, [0.1, 0.2, 0.25, 0.4, 0.5]),
    i2: elegir(rng, [0.1, 0.2, 0.25, 0.4, 0.5]),
    hi: multiplo(rng, 0.2, 1.8, 0.1),
  }),
  resolver: ({ h2, i2, hi }) => {
    const num = redondear(hi * hi, 4);
    const den = redondear(h2 * i2, 4);
    const Q = redondear(num / den, 2);
    const sentido = Q < 50.5
      ? `${fmt(Q)} < 50.5: no está en equilibrio y se desplaza a la DERECHA (forma más HI)`
      : Q > 50.5
        ? `${fmt(Q)} > 50.5: no está en equilibrio y se desplaza a la IZQUIERDA (se descompone HI)`
        : 'Q = Kc: el sistema está en equilibrio';
    return {
      problema: `En un recipiente cerrado a 448 °C se estudia el equilibrio H₂ + I₂ ⇌ 2 HI, cuya constante es Kc = 50.5. COCIENTE Q (inciso a): en cierto instante se miden [H₂] = ${fmt(h2, 2, 2)} M, [I₂] = ${fmt(i2, 2, 2)} M y [HI] = ${fmt(hi, 2, 2)} M. Calcula el cociente de reacción Q (redondea a dos decimales).`,
      respuesta: Q,
      tolerancia: 0.01,
      pasos: [
        'Q = [HI]² / ([H₂]·[I₂]).',
        `Q = (${fmt(hi, 2, 2)})² / (${fmt(h2, 2, 2)} × ${fmt(i2, 2, 2)}) = ${fmt(num)} / ${fmt(den)}.`,
        `Q = ${fmt(Q)}. Compara con Kc: ${sentido}.`,
      ],
      respuestaTexto: `Q = ${fmt(Q)}`,
    };
  },
});

// ── CNEYT-IV-P11-A2 · Gases en la respiración aerobia ────────────────────────
const gasesRespiracion = definir({
  original: { n: 5, gas: 'O₂' as 'O₂' | 'CO₂' | 'H₂O' },
  elegir: (rng) => ({ n: elegir(rng, [0.5, 1.5, 2, 2.5, 3, 4, 6, 7, 8, 9, 10, 12, 15, 20]), gas: elegir(rng, ['O₂', 'CO₂', 'H₂O'] as const) }),
  resolver: ({ n, gas }) => {
    const total = redondear(n * 6, 2);
    const verbo = gas === 'O₂' ? 'consume' : 'produce';
    return {
      problema: `GASES (inciso d). Según la ecuación global C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O, si una célula oxida por completo ${fmt(n)} mol de glucosa, ¿cuántos moles de ${gas} ${verbo}?`,
      respuesta: total,
      unidades: `mol de ${gas}`,
      tolerancia: 0,
      pasos: [
        `La ecuación es 1 : 6 entre la glucosa y el ${gas}.`,
        `Multiplica los moles de glucosa por 6: ${fmt(n)} × 6.`,
        `${gas} = ${fmt(total)} mol.`,
      ],
      respuestaTexto: `${fmt(total)} mol de ${gas}`,
    };
  },
});

// ── CNEYT-V-P02-A2 · MRUA en la autopista Puebla-CDMX ────────────────────────
const mruaAutopista = definir({
  original: { a: 3, t: 10 },
  elegir: (rng) => {
    for (let i = 0; i < 60; i++) {
      const a = elegir(rng, [1.5, 2, 2.5, 3, 3.5, 4]);
      const t = elegir(rng, [4, 5, 6, 8, 10, 12]);
      if (a * t <= 33 && a * t >= 12) return { a, t };
    }
    return { a: 2, t: 10 };
  },
  resolver: ({ a, t }) => {
    const v = redondear(a * t, 2);
    const x = redondear(0.5 * a * t * t, 2);
    return {
      problema: `Un automóvil en la autopista Puebla-CDMX parte del reposo y acelera uniformemente a ${fmt(a)} m/s² durante ${fmt(t)} segundos. Responde el inciso (b): ¿qué distancia recorrió durante esos ${fmt(t)} segundos de aceleración? Usa las ecuaciones del MRUA.`,
      respuesta: x,
      unidades: 'm',
      tolerancia: 0.5,
      pasos: [
        `Datos: v₀ = 0 (parte del reposo), a = ${fmt(a)} m/s², t = ${fmt(t)} s.`,
        `Velocidad final (inciso a): v = v₀ + a·t = 0 + ${fmt(a)} × ${fmt(t)} = ${fmt(v)} m/s ≈ ${fmt(v * 3.6, 1)} km/h.`,
        `Distancia: x = v₀·t + ½·a·t² = 0 + ½ × ${fmt(a)} × ${fmt(t)}² = ½ × ${fmt(a)} × ${fmt(t * t)}.`,
        `x = ${fmt(x)} m. (Verifica: x = v² / (2a) = ${fmt(v * v)} / ${fmt(2 * a)} = ${fmt(x)} m ✓.)`,
      ],
      respuestaTexto: `${fmt(x)} m`,
    };
  },
});

// ── CNEYT-V-P03-A2 · Peso en la Luna ────────────────────────────────────────
const pesoLuna = definir({
  original: { m: 70 },
  elegir: (rng) => ({ m: entero(rng, 45, 95) }),
  resolver: ({ m }) => {
    const W = redondear(m * 1.62, 2);
    const kgf = redondear(W / 9.8, 1);
    return {
      problema: `Una persona de ${fmt(m)} kg viaja en una misión espacial y llega a la Luna (g_Luna = 1.62 m/s²). Responde el inciso (b): ¿cuánto pesa ahí en newtons?`,
      respuesta: W,
      unidades: 'N',
      tolerancia: 0.5,
      pasos: [
        'El peso es W = m × g; la masa no cambia al ir a la Luna.',
        `Peso en la Luna = ${fmt(m)} × 1.62 = ${fmt(W)} N.`,
        `En kilogramos-fuerza: ${fmt(W)} / 9.8 ≈ ${fmt(kgf)} kg-fuerza (en la Tierra pesaría ${fmt(m * 9.8)} N). Respuesta: ${fmt(W)} N.`,
      ],
      respuestaTexto: `${fmt(W)} N`,
    };
  },
});

// ── CNEYT-V-P07-A2 · Potencia en una resistencia (Ohm) ──────────────────────
const potenciaOhm = definir({
  original: { R: 470, V: 120 },
  elegir: (rng) => ({ R: elegir(rng, [100, 150, 220, 270, 330, 390, 470, 560, 680, 820, 1000]), V: elegir(rng, [120, 127]) }),
  resolver: ({ R, V }) => {
    const I = redondear(V / R, 3);
    const P = redondear((V * V) / R, 1);
    return {
      problema: `Una resistencia de ${fmt(R)} Ω está conectada a ${fmt(V)} V (corriente alterna de la red CFE). Responde el inciso (a-ii): ¿cuál es la potencia eléctrica disipada, en vatios? Redondea a una décima.`,
      respuesta: P,
      unidades: 'W',
      tolerancia: 0.5,
      pasos: [
        `Ley de Ohm (a-i): I = V / R = ${fmt(V)} / ${fmt(R)} ≈ ${fmt(I)} A.`,
        `Potencia: P = V² / R = ${fmt(V)}² / ${fmt(R)} = ${fmt(V * V)} / ${fmt(R)}.`,
        `P ≈ ${fmt(P)} W (verificación: P = I × V ≈ ${fmt(I)} × ${fmt(V)} ≈ ${fmt(I * V, 1)} W).`,
      ],
      respuestaTexto: `${fmt(P)} W`,
    };
  },
});

// ── CNEYT-V-P09-A2 · Presión hidrostática en una presa ───────────────────────
const presionPresa = definir({
  original: { h: 8 },
  elegir: (rng) => ({ h: elegir(rng, [3, 4, 5, 6, 7, 9, 10, 12, 15, 18, 20, 25, 30, 40]) }),
  resolver: ({ h }) => {
    const P = redondear(1000 * 9.81 * h, 2);
    const abs = redondear(101325 + P, 2);
    return {
      problema: `PRESIÓN (inciso b). Usa g = 9.81 m/s² y la densidad del agua ρ = 1000 kg/m³. ¿Cuál es la presión manométrica (debida solo al agua) a una profundidad de h = ${fmt(h)} m en una presa? Responde en pascales (Pa).`,
      respuesta: P,
      unidades: 'Pa',
      tolerancia: 10,
      pasos: [
        'Presión hidrostática (manométrica): P = ρ·g·h.',
        `P = 1000 × 9.81 × ${fmt(h)} = ${fmt(P)} Pa ≈ ${fmt(P / 1000, 1)} kPa.`,
        `Si además sumas la presión atmosférica (101,325 Pa), la absoluta sería ${fmt(abs)} Pa. La manométrica es ${fmt(P)} Pa.`,
      ],
      respuestaTexto: `${fmt(P)} Pa`,
    };
  },
});

// ── CNEYT-VI-P03-A2 · ATP total de la respiración aerobia ────────────────────
const atpTotal = definir({
  original: { n: 1 },
  elegir: (rng) => ({ n: entero(rng, 2, 15) }),
  resolver: ({ n }) => {
    const total = 36 * n;
    const una = n === 1;
    return {
      problema: `Una célula lleva a cabo la respiración aerobia completa de ${fmt(n)} ${una ? 'molécula' : 'moléculas'} de glucosa. Por cada glucosa, la glucólisis produce 2 ATP netos, el ciclo de Krebs produce 2 ATP y la cadena transportadora de electrones produce 32 ATP. ¿Cuántos ATP se producen en total?`,
      respuesta: total,
      unidades: 'ATP',
      tolerancia: 0,
      pasos: [
        'Glucólisis (citoplasma): 1 glucosa → 2 piruvatos + 2 ATP netos + 2 NADH.',
        'Ciclo de Krebs (matriz mitocondrial): 2 ATP; cadena transportadora (membrana interna): 32 ATP.',
        'Por glucosa: 2 + 2 + 32 = 36 ATP.',
        una ? `Total: 36 × 1 = ${fmt(total)} ATP.` : `Total: 36 × ${fmt(n)} = ${fmt(total)} ATP.`,
      ],
      respuestaTexto: `${fmt(total)} ATP`,
    };
  },
});

// ── CNEYT-VI-P05-A2 · Cruces monohíbridos con cuadro de Punnett ──────────────
const CARACTERES = [
  { rasgo: 'color de semilla', dom: 'amarilla', rec: 'verde' },
  { rasgo: 'forma de la semilla', dom: 'lisa', rec: 'rugosa' },
  { rasgo: 'color de la flor', dom: 'morada', rec: 'blanca' },
  { rasgo: 'altura de la planta', dom: 'alta', rec: 'enana' },
] as const;
const GENOTIPOS = ['AA', 'Aa', 'aa'] as const;
type Objetivo = 'AA' | 'Aa' | 'aa' | 'dominante' | 'recesivo';

function punnett(p1: string, p2: string): string[] {
  const hijos: string[] = [];
  for (const g1 of p1) for (const g2 of p2) hijos.push([g1, g2].sort().join(''));
  return hijos; // 'A' < 'a' en orden de código, así que 'Aa' queda normalizado
}

const crucePunnett = definir({
  original: { p1: 'Aa', p2: 'Aa', obj: 'aa' as Objetivo, c: 0 },
  elegir: (rng) => {
    for (let i = 0; i < 60; i++) {
      const p1 = elegir(rng, GENOTIPOS);
      const p2 = elegir(rng, GENOTIPOS);
      const obj = elegir(rng, ['AA', 'Aa', 'aa', 'dominante', 'recesivo'] as const);
      const hijos = punnett(p1, p2);
      const n = hijos.filter((h) => cumple(h, obj)).length;
      if (n > 0 && n < 4) return { p1, p2, obj: obj as Objetivo, c: entero(rng, 0, CARACTERES.length - 1) };
    }
    return { p1: 'Aa', p2: 'aa', obj: 'aa' as Objetivo, c: 0 };
  },
  resolver: ({ p1, p2, obj, c }) => {
    const car = CARACTERES[c]!;
    const hijos = punnett(p1, p2);
    const n = hijos.filter((h) => cumple(h, obj)).length;
    const pct = (n / 4) * 100;
    const objTxt = obj === 'dominante' ? `fenotipo dominante (${car.dom})`
      : obj === 'recesivo' ? `fenotipo recesivo (${car.rec})`
        : obj === 'aa' ? 'descendencia homocigota recesiva (aa)'
          : obj === 'AA' ? 'descendencia homocigota dominante (AA)'
            : 'descendencia heterocigota (Aa)';
    const gametos = (g: string) => (g[0] === g[1] ? `solo gametos ${g[0]}` : `gametos ${g[0]} y ${g[1]} (50 % cada uno)`);
    const conteo = GENOTIPOS.map((g) => `${g}: ${hijos.filter((h) => h === g).length}/4`).join(', ');
    return {
      problema: `Cruza dos plantas de chícharo para el carácter ${car.rasgo} (A = ${car.dom}, dominante; a = ${car.rec}, recesivo): ${p1} × ${p2}. Usa el cuadro de Punnett para determinar la probabilidad de obtener ${objTxt}. Expresa la respuesta como porcentaje.`,
      respuesta: pct,
      unidades: '%',
      tolerancia: 0,
      pasos: [
        `Gametos: el progenitor ${p1} produce ${gametos(p1)}; el ${p2} produce ${gametos(p2)}.`,
        `Cuadro de Punnett (4 casillas): ${hijos.join(', ')} → ${conteo}.`,
        obj === 'dominante' ? 'Fenotipo dominante: cuenta AA y Aa (basta un alelo A).'
          : obj === 'recesivo' ? 'Fenotipo recesivo: solo aa lo muestra.'
            : `Cuenta las casillas ${obj}.`,
        `${n} de 4 casillas = ${fmt(pct)} %.`,
      ],
      respuestaTexto: `${fmt(pct)} %`,
    };
  },
});
function cumple(h: string, obj: Objetivo): boolean {
  if (obj === 'dominante') return h.includes('A');
  if (obj === 'recesivo') return h === 'aa';
  return h === obj;
}

// ── CNEYT-VI-P09-A2 · Combinaciones por distribución independiente ───────────
const ESPECIES = [
  { nombre: 'una célula somática humana', dosN: 46 },
  { nombre: 'una célula de mosca de la fruta (Drosophila)', dosN: 8 },
  { nombre: 'una célula de chícharo', dosN: 14 },
  { nombre: 'una célula de cebolla', dosN: 16 },
  { nombre: 'una célula de maíz', dosN: 20 },
  { nombre: 'una célula de frijol', dosN: 22 },
  { nombre: 'una célula de chile', dosN: 24 },
  { nombre: 'una célula de ajolote mexicano', dosN: 28 },
] as const;

const recombinacion = definir({
  original: { e: 0 },
  elegir: (rng) => ({ e: entero(rng, 1, ESPECIES.length - 1) }),
  resolver: ({ e }) => {
    const { nombre, dosN } = ESPECIES[e]!;
    const n = dosN / 2;
    const comb = 2 ** n;
    return {
      problema: `Trabaja con ${nombre} de 2n = ${dosN} cromosomas. RECOMBINACIÓN (inciso c): sin contar el crossing over, ¿cuántas combinaciones distintas de cromosomas puede generar la distribución independiente de sus ${n} pares en la meiosis?`,
      respuesta: comb,
      unidades: 'combinaciones',
      tolerancia: 0,
      pasos: [
        `Número de pares: n = 2n / 2 = ${dosN} / 2 = ${n}.`,
        'Cada par puede orientarse de 2 maneras en la metafase I, de forma independiente: 2ⁿ combinaciones.',
        `2^${n} = ${fmt(comb)} combinaciones posibles.`,
      ],
      respuestaTexto: `2^${n} = ${fmt(comb)} combinaciones`,
    };
  },
});

// ── CNEYT-VI-P10-A2 · Escala de la célula ───────────────────────────────────
const CELULAS = [
  { nombre: 'una célula animal típica', um: 20 },
  { nombre: 'un glóbulo rojo', um: 8 },
  { nombre: 'una célula de levadura', um: 5 },
  { nombre: 'una bacteria E. coli', um: 2 },
  { nombre: 'una célula vegetal', um: 50 },
  { nombre: 'una célula de la mucosa de la boca', um: 40 },
  { nombre: 'un óvulo humano', um: 100 },
] as const;

const escalaCelula = definir({
  original: { c: 0, mm: 1 },
  elegir: (rng) => ({ c: entero(rng, 0, CELULAS.length - 1), mm: elegir(rng, [1, 2, 3, 5]) }),
  resolver: ({ c, mm }) => {
    const { nombre, um } = CELULAS[c]!;
    const total = mm * 1000;
    const n = total / um;
    return {
      problema: `ESCALA (inciso a). ${nombre[0]!.toUpperCase()}${nombre.slice(1)} mide alrededor de ${fmt(um)} micrómetros (µm). Sabiendo que 1 mm = 1000 µm, ¿cuántas de esas células cabrían, en fila, en ${fmt(mm)} mm?`,
      respuesta: n,
      unidades: 'células',
      tolerancia: 0,
      pasos: [
        `Convierte a la misma unidad: ${fmt(mm)} mm = ${fmt(mm)} × 1000 = ${fmt(total)} µm.`,
        `Divide la longitud entre el tamaño de una célula: ${fmt(total)} µm ÷ ${fmt(um)} µm.`,
        `Caben ${fmt(n)} células en fila en ${fmt(mm)} mm.`,
      ],
      respuestaTexto: `${fmt(n)} células`,
    };
  },
});

export const DEFINICIONES_CNEYT: Record<string, Definicion> = {
  'CNEYT-I-P02-A6': densidadMetal,
  'CNEYT-I-P04-A6': porcentajeMasa,
  'CNEYT-I-P06-A6': conversionLongitud,
  'CNEYT-II-P05-A2': trabajoPotencia,
  'CNEYT-II-P11-A2': conduccionVentana,
  'CNEYT-III-P02-A2': reglaDiezPorciento,
  'CNEYT-III-P09-A2': conteoAtomos,
  'CNEYT-III-P10-A2': densidadAgua,
  'CNEYT-III-P11-A2': oxigenoFotosintesis,
  'CNEYT-IV-P01-A2': balanceo,
  'CNEYT-IV-P09-A2': potencialPila,
  'CNEYT-IV-P10-A2': cocienteQ,
  'CNEYT-IV-P11-A2': gasesRespiracion,
  'CNEYT-V-P02-A2': mruaAutopista,
  'CNEYT-V-P03-A2': pesoLuna,
  'CNEYT-V-P07-A2': potenciaOhm,
  'CNEYT-V-P09-A2': presionPresa,
  'CNEYT-VI-P03-A2': atpTotal,
  'CNEYT-VI-P05-A2': crucePunnett,
  'CNEYT-VI-P09-A2': recombinacion,
  'CNEYT-VI-P10-A2': escalaCelula,
};
