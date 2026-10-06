/**
 * Generadores de variantes — Pensamiento Matemático I, II y III.
 * Cada uno conserva la situación y el procedimiento del ejercicio original.
 */
import {
  definir, elegir, entero, multiplo, redondear, fmt, pesos, poli, sup,
  type Definicion,
} from './motor';

const esDecimalCorto = (x: number, dec = 2) => Math.abs(x * 10 ** dec - Math.round(x * 10 ** dec)) < 1e-9;

// ═══════════════════════════════ PM-I ═══════════════════════════════════════

// ── PM-I-P01-A2 · Receta escalada ───────────────────────────────────────────
type Ingrediente = 'arroz' | 'pollo' | 'tomates';
const receta = definir({
  original: { p0: 4, p1: 10, arroz: 2, pollo: 0.5, tomates: 3, ing: 'arroz' as Ingrediente },
  elegir: (rng) => {
    for (let i = 0; i < 80; i++) {
      const p0 = elegir(rng, [2, 4, 5, 6, 8]);
      const p1 = entero(rng, 3, 20);
      const arroz = elegir(rng, [1, 1.5, 2, 3]);
      const pollo = elegir(rng, [0.5, 0.75, 1, 1.5]);
      const tomates = entero(rng, 2, 6);
      const ing = elegir(rng, ['arroz', 'pollo', 'tomates'] as const);
      const q = { arroz, pollo, tomates }[ing];
      if (p1 !== p0 && esDecimalCorto((q * p1) / p0)) return { p0, p1, arroz, pollo, tomates, ing: ing as Ingrediente };
    }
    return { p0: 4, p1: 8, arroz: 2, pollo: 0.5, tomates: 3, ing: 'arroz' as Ingrediente };
  },
  resolver: ({ p0, p1, arroz, pollo, tomates, ing }) => {
    const q = { arroz, pollo, tomates }[ing];
    const v = redondear((q * p1) / p0, 2);
    const pregunta = { arroz: '¿cuántas tazas de arroz necesitas', pollo: '¿cuántos kilogramos de pollo necesitas', tomates: '¿cuántos tomates necesitas' }[ing];
    const unidad = { arroz: 'tazas', pollo: 'kg', tomates: 'tomates' }[ing];
    const nota = ing === 'tomates' && !Number.isInteger(v) ? ' (en la práctica comprarías un tomate más)' : '';
    return {
      problema: `Una receta para ${p0} personas requiere ${fmt(arroz)} tazas de arroz, ${fmt(pollo)} kg de pollo y ${tomates} tomates. Si quieres preparar la receta para ${p1} personas, ${pregunta}?`,
      respuesta: v,
      unidades: unidad,
      tolerancia: 0.01,
      pasos: [
        `Identifica la razón entre la nueva cantidad y la original: ${p1} personas / ${p0} personas.`,
        `Multiplica el ingrediente por esa razón: ${fmt(q)} × ${p1} / ${p0} = ${fmt(q * p1)} / ${p0}.`,
        `Resultado: ${fmt(v)} ${unidad}${nota}.`,
      ],
      respuestaTexto: `${fmt(v)} ${unidad}`,
    };
  },
});

// ── PM-I-P02-A2 · Descenso de temperatura (enteros) ──────────────────────────
const descensoTemperatura = definir({
  original: { T1: 8, T2: -3, lugar: '' },
  elegir: (rng) => ({
    T1: entero(rng, 2, 18),
    T2: entero(rng, -12, -1),
    lugar: elegir(rng, ['En Chihuahua, durante una noche de invierno, ', 'En Zacatecas, al amanecer, ', 'En la sierra de Durango, ', 'En el Nevado de Toluca, ']),
  }),
  resolver: ({ T1, T2, lugar }) => {
    const d = T1 - T2;
    return {
      problema: `${lugar || ''}${lugar ? 'la' : 'La'} temperatura bajó de ${fmt(T1)} °C a ${fmt(T2)} °C. ¿Cuántos grados descendió?`,
      respuesta: d,
      unidades: '°C',
      tolerancia: 0,
      pasos: [
        'Descenso = temperatura inicial − temperatura final.',
        `Descenso = ${fmt(T1)} − (${fmt(T2)}) = ${fmt(T1)} + ${fmt(-T2)}.`,
        `Descendió ${fmt(d)} grados.`,
      ],
      respuestaTexto: `${fmt(d)} °C`,
    };
  },
});

// ── PM-I-P04-A2 · Descuentos sucesivos ──────────────────────────────────────
const descuentos = definir({
  original: { P: 850, d1: 30, d2: 10, art: 'una chamarra' },
  elegir: (rng) => ({
    P: multiplo(rng, 300, 2000, 50),
    d1: elegir(rng, [10, 15, 20, 25, 30, 40]),
    d2: elegir(rng, [5, 10, 15]),
    art: elegir(rng, ['una chamarra', 'unos tenis', 'una mochila', 'unos audífonos', 'una bicicleta']),
  }),
  resolver: ({ P, d1, d2, art }) => {
    const x1 = redondear((P * d1) / 100, 2);
    const inter = redondear(P - x1, 2);
    const x2 = redondear((inter * d2) / 100, 2);
    const final = redondear(inter - x2, 2);
    const ahorro = redondear(P - final, 2);
    return {
      problema: `Una tienda tiene ${art} con precio original de ${pesos(P)}. Ofrece un descuento del ${d1} %. Además, si pagas en efectivo, te dan un ${d2} % adicional sobre el precio con descuento. ¿Cuánto pagas finalmente?`,
      respuesta: final,
      unidades: 'pesos',
      tolerancia: 0.01,
      pasos: [
        `Primer descuento: ${d1} % de ${pesos(P)} = ${pesos(x1)}.`,
        `Precio intermedio: ${pesos(P)} − ${pesos(x1)} = ${pesos(inter)}.`,
        `Segundo descuento: ${d2} % de ${pesos(inter)} = ${pesos(x2)}.`,
        `Precio final: ${pesos(inter)} − ${pesos(x2)} = ${pesos(final)} (ahorraste ${pesos(ahorro)} en total).`,
      ],
      respuestaTexto: pesos(final),
    };
  },
});

// ── PM-I-P05-A2 · Proporcionalidad inversa (obreros) ─────────────────────────
const obreros = definir({
  original: { w1: 5, d1: 12, w2: 15 },
  elegir: (rng) => {
    for (let i = 0; i < 80; i++) {
      const w1 = entero(rng, 2, 10);
      const d1 = entero(rng, 6, 30);
      const w2 = entero(rng, 2, 20);
      const k = w1 * d1;
      if (w2 !== w1 && k % w2 === 0 && k / w2 >= 2) return { w1, d1, w2 };
    }
    return { w1: 4, d1: 12, w2: 8 };
  },
  resolver: ({ w1, d1, w2 }) => {
    const k = w1 * d1;
    const t = k / w2;
    return {
      problema: `Si ${w1} obreros construyen un muro en ${d1} días, ¿cuántos días tardarán ${w2} obreros en construir el mismo muro?`,
      respuesta: t,
      unidades: 'días',
      tolerancia: 0,
      pasos: [
        `${w2 > w1 ? 'Más' : 'Menos'} obreros → ${w2 > w1 ? 'menos' : 'más'} días: es proporcionalidad inversa (el producto obreros × días es constante).`,
        `k = ${w1} × ${d1} = ${k}.`,
        `Tiempo = ${k} / ${w2} = ${fmt(t)} días.`,
      ],
      respuestaTexto: `${fmt(t)} días`,
    };
  },
});

// ── PM-I-P05-A6 · Regla de tres directa ─────────────────────────────────────
const reglaDeTres = definir({
  original: { p0: 4, h: 300, p1: 6 },
  elegir: (rng) => {
    for (let i = 0; i < 80; i++) {
      const p0 = elegir(rng, [2, 4, 5, 6, 8, 10]);
      const h = multiplo(rng, 100, 600, 50);
      const p1 = entero(rng, 2, 20);
      if (p1 !== p0 && (h * p1) % p0 === 0) return { p0, h, p1 };
    }
    return { p0: 4, h: 200, p1: 6 };
  },
  resolver: ({ p0, h, p1 }) => {
    const x = (h * p1) / p0;
    return {
      problema: `Una receta para ${p0} personas necesita ${fmt(h)} g de harina. ¿Cuánta harina se necesita para ${p1} personas?`,
      respuesta: x,
      unidades: 'g',
      tolerancia: 0,
      pasos: [
        `Plantea la proporción: ${fmt(h)}/${p0} = x/${p1}.`,
        `x = (${fmt(h)} × ${p1}) / ${p0}.`,
        `x = ${fmt(h * p1)} / ${p0} = ${fmt(x)} g.`,
      ],
      respuestaTexto: `${fmt(x)} g`,
    };
  },
});

// ── PM-I-P06-A2 · Litros de una piscina ─────────────────────────────────────
const piscina = definir({
  original: { L: 25, W: 10, D: 1.8 },
  elegir: (rng) => ({ L: elegir(rng, [10, 12, 15, 20, 25, 50]), W: entero(rng, 5, 20), D: elegir(rng, [1.2, 1.5, 1.8, 2, 2.5]) }),
  resolver: ({ L, W, D }) => {
    const V = redondear(L * W * D, 2);
    const litros = redondear(V * 1000, 0);
    return {
      problema: `Una piscina mide ${fmt(L)} m de largo, ${fmt(W)} m de ancho y ${fmt(D)} m de profundidad. ¿Cuántos litros de agua caben? (1 m³ = 1,000 L)`,
      respuesta: litros,
      unidades: 'L',
      tolerancia: 0,
      pasos: [
        `Volumen = largo × ancho × profundidad = ${fmt(L)} × ${fmt(W)} × ${fmt(D)} = ${fmt(V)} m³.`,
        `Convierte a litros: ${fmt(V)} × 1,000 = ${fmt(litros)} L.`,
      ],
      respuestaTexto: `${fmt(litros)} litros`,
    };
  },
});

// ── PM-I-P06-A6 · Notación científica y micrómetros ─────────────────────────
const MICROS = [
  { nombre: 'Una bacteria', e: -6, a: [1, 2, 3, 4, 5] },
  { nombre: 'Una célula de levadura', e: -6, a: [3, 4, 5, 6, 8] },
  { nombre: 'Un glóbulo rojo', e: -6, a: [7, 8] },
  { nombre: 'Un grano de polen', e: -5, a: [2, 3, 4, 5, 6, 8, 9] },
  { nombre: 'Una célula de la piel', e: -5, a: [3, 4] },
  { nombre: 'Una ameba', e: -4, a: [2, 3, 4, 5] },
] as const;
const decimalPequeno = (a: number, e: number) => `0.${'0'.repeat(-e - 1)}${a}`;

const notacionCientifica = definir({
  original: { o: 0, a: 2 },
  elegir: (rng) => {
    const o = entero(rng, 0, MICROS.length - 1);
    return { o, a: elegir(rng, MICROS[o]!.a) as number };
  },
  resolver: ({ o, a }) => {
    const { nombre, e } = MICROS[o]!;
    const um = a * 10 ** (e + 6);
    const dec = decimalPequeno(a, e);
    return {
      problema: `${nombre} mide ${dec} metros. (a) Escribe esa medida en notación científica. (b) Si 1 metro = 1 000 000 micrómetros (µm), ¿cuántos µm mide? Para calificar, escribe la respuesta del inciso (b).`,
      respuesta: um,
      unidades: 'µm',
      tolerancia: 0,
      pasos: [
        `${dec} = ${a} × 10${sup(e)} m (el punto se corre ${-e} lugares).`,
        `${dec} m × 1,000,000 = ${fmt(um)} µm.`,
      ],
      respuestaTexto: `${a} × 10${sup(e)} m, equivalente a ${fmt(um)} µm`,
    };
  },
});

// ── PM-I-P08-A2 · Valor posicional ──────────────────────────────────────────
const POSICIONES = ['unidades', 'decenas', 'centenas', 'unidades de millar', 'decenas de millar', 'centenas de millar', 'unidades de millón'];
const POSICION_SING = ['unidad', 'decena', 'centena', 'unidad de millar', 'decena de millar', 'centena de millar', 'unidad de millón'];

const valorPosicional = definir({
  original: { N: 4700, k: 2 },
  elegir: (rng) => {
    for (let i = 0; i < 80; i++) {
      const cifras = entero(rng, 4, 7);
      const N = entero(rng, 10 ** (cifras - 1), 10 ** cifras - 1);
      const k = entero(rng, 1, cifras - 1);
      const s = String(N);
      const d = Math.floor(N / 10 ** k) % 10;
      if (d !== 0 && s.split('').filter((c) => c === String(d)).length === 1) return { N, k };
    }
    return { N: 35260, k: 3 };
  },
  resolver: ({ N, k }) => {
    const d = Math.floor(N / 10 ** k) % 10;
    const v = d * 10 ** k;
    return {
      problema: `El sistema indoarábigo es posicional y de base 10. En el número ${fmt(N)}, ¿qué valor representa el dígito ${d}?`,
      respuesta: v,
      tolerancia: 0,
      pasos: [
        `El ${d} está en la posición de las ${POSICIONES[k]}.`,
        `Una ${POSICION_SING[k]} vale ${fmt(10 ** k)}, y hay ${d}: ${d} × ${fmt(10 ** k)} = ${fmt(v)}.`,
      ],
      respuestaTexto: fmt(v),
    };
  },
});

// ── PM-I-P09-A2 · Potencias ─────────────────────────────────────────────────
const potencia = definir({
  original: { b: 2, n: 5 },
  elegir: (rng) => {
    for (let i = 0; i < 80; i++) {
      const b = entero(rng, 2, 9);
      const n = entero(rng, 3, 7);
      if (b ** n <= 10000) return { b, n };
    }
    return { b: 3, n: 4 };
  },
  resolver: ({ b, n }) => {
    const v = b ** n;
    return {
      problema: `Calcula: (a) ${b}${sup(n)}`,
      respuesta: v,
      tolerancia: 0,
      pasos: [
        'Una potencia es una multiplicación repetida de la base tantas veces como indica el exponente.',
        `${b}${sup(n)} = ${Array(n).fill(b).join('×')} = ${fmt(v)}.`,
      ],
      respuestaTexto: fmt(v),
    };
  },
});

// ── PM-I-P09-A6 · Producto de potencias de igual base ───────────────────────
const productoPotencias = definir({
  original: { b: 3, m: 2, n: 3 },
  elegir: (rng) => {
    for (let i = 0; i < 80; i++) {
      const b = elegir(rng, [2, 3, 4, 5, 10]);
      const m = entero(rng, 1, 5);
      const n = entero(rng, 2, 5);
      if (b ** (m + n) <= 100000) return { b, m, n };
    }
    return { b: 2, m: 3, n: 4 };
  },
  resolver: ({ b, m, n }) => {
    const v = b ** (m + n);
    return {
      problema: `(a) Aplica la regla del producto de potencias de igual base: ${b}${sup(m)} × ${b}${sup(n)}.`,
      respuesta: v,
      tolerancia: 0,
      pasos: [
        'Producto de potencias de igual base: se conserva la base y se suman los exponentes (aᵐ × aⁿ = aᵐ⁺ⁿ).',
        `${b}${sup(m)} × ${b}${sup(n)} = ${b}${sup(m)}⁺${sup(n)} = ${b}${sup(m + n)} = ${fmt(v)}.`,
      ],
      respuestaTexto: fmt(v),
    };
  },
});

// ── PM-I-P10-A2 · Jerarquía de operaciones ──────────────────────────────────
const jerarquia = definir({
  original: { a: 2, b: 3, c: 4 },
  elegir: (rng) => ({ a: entero(rng, 1, 25), b: entero(rng, 2, 12), c: entero(rng, 2, 12) }),
  resolver: ({ a, b, c }) => {
    const v = a + b * c;
    return {
      problema: `Calcula: ${a} + ${b} × ${c}`,
      respuesta: v,
      tolerancia: 0,
      pasos: [
        `Primero la multiplicación: ${b} × ${c} = ${b * c}.`,
        `Luego la suma: ${a} + ${b * c} = ${v}.`,
      ],
      respuestaTexto: String(v),
    };
  },
});

// ── PM-I-P10-A6 · Cálculo combinado con agrupación ──────────────────────────
const agrupacion = definir({
  original: { a: 12, b: 1, c: 2, d: 5, e: 2 },
  elegir: (rng) => {
    const b = entero(rng, 1, 6);
    const c = entero(rng, 1, 6);
    return { a: (b + c) * entero(rng, 2, 9), b, c, d: entero(rng, 2, 9), e: entero(rng, 2, 9) };
  },
  resolver: ({ a, b, c, d, e }) => {
    const s = b + c;
    const q = a / s;
    const v = q + d * e;
    return {
      problema: `Calcula: ${a} ÷ (${b} + ${c}) + ${d} × ${e}`,
      respuesta: v,
      tolerancia: 0,
      pasos: [
        `Paréntesis: ${b} + ${c} = ${s}.`,
        `División: ${a} ÷ ${s} = ${q}.`,
        `Multiplicación: ${d} × ${e} = ${d * e}.`,
        `Suma final: ${q} + ${d * e} = ${v}.`,
      ],
      respuestaTexto: String(v),
    };
  },
});

// ═══════════════════════════════ PM-II ══════════════════════════════════════

// ── PM-II-P01-A2 · Término n de una sucesión aritmética ─────────────────────
const sucesion = definir({
  original: { a1: 4, d: 5, k: 10 },
  elegir: (rng) => ({ a1: entero(rng, 1, 15), d: entero(rng, 2, 9), k: entero(rng, 8, 30) }),
  resolver: ({ a1, d, k }) => {
    const terminos = [0, 1, 2, 3].map((i) => a1 + i * d);
    const v = a1 + (k - 1) * d;
    return {
      problema: `La siguiente secuencia sigue un patrón aritmético: ${terminos.join(', ')}, … (b) ¿Cuál es el término número ${k}?`,
      respuesta: v,
      tolerancia: 0,
      pasos: [
        `La razón es la diferencia entre términos consecutivos: ${terminos[1]} − ${terminos[0]} = ${d}.`,
        `El término n es: aₙ = a₁ + (n − 1)·d, con a₁ = ${a1} y d = ${d}.`,
        `a${sub(k)} = ${a1} + (${k} − 1)·${d} = ${a1} + ${(k - 1) * d} = ${fmt(v)}.`,
      ],
      respuestaTexto: `a${sub(k)} = ${fmt(v)}`,
    };
  },
});
function sub(n: number): string {
  const S: Record<string, string> = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
  return [...String(n)].map((c) => S[c] ?? c).join('');
}

// ── PM-II-P09-A8 · Propiedad de uniformidad ─────────────────────────────────
const uniformidad = definir({
  original: { a: 7, x: 5 },
  elegir: (rng) => ({ a: entero(rng, 2, 25), x: entero(rng, 1, 30) }),
  resolver: ({ a, x }) => {
    const b = x + a;
    return {
      problema: `Imagina una balanza en equilibrio: lo que se hace de un lado debe hacerse del otro. (a) Usa la propiedad de uniformidad para hallar x en x + ${a} = ${b}. ¿Qué operación aplicas en ambos lados?`,
      respuesta: x,
      tolerancia: 0,
      pasos: [
        `Resta ${a} en ambos lados (propiedad de uniformidad): x + ${a} − ${a} = ${b} − ${a}.`,
        `Comprueba sustituyendo: ${x} + ${a} = ${b}, que es verdadero.`,
        `x = ${x}.`,
      ],
      respuestaTexto: `x = ${x}`,
    };
  },
});

// ═══════════════════════════════ PM-III ═════════════════════════════════════

// ── PM-III-P01-A2 · Pitágoras en una rampa ──────────────────────────────────
const rampa = definir({
  original: { H: 4.8, h: 0.6 },
  elegir: (rng) => {
    for (let i = 0; i < 80; i++) {
      const H = multiplo(rng, 2.4, 9.6, 0.4);
      const h = multiplo(rng, 0.2, 1.2, 0.1);
      const r = h / H;
      if (r >= 1 / 14 && r <= 1 / 6) return { H, h };
    }
    return { H: 4.8, h: 0.6 };
  },
  resolver: ({ H, h }) => {
    const H2 = redondear(H * H, 4);
    const h2 = redondear(h * h, 4);
    const s = redondear(H2 + h2, 4);
    const c = redondear(Math.sqrt(s), 2);
    return {
      problema: `Un ingeniero civil necesita verificar una rampa de acceso para personas con discapacidad. La rampa tiene una longitud horizontal de ${fmt(H)} m y sube una altura de ${fmt(h)} m. (a) ¿Cuál es la longitud real de la superficie inclinada de la rampa? Redondea a centésimos.`,
      respuesta: c,
      unidades: 'm',
      tolerancia: 0.05,
      pasos: [
        `Identifica los catetos: horizontal = ${fmt(H)} m, vertical = ${fmt(h)} m. Aplica c² = a² + b².`,
        `c² = (${fmt(H)})² + (${fmt(h)})² = ${fmt(H2)} + ${fmt(h2)} = ${fmt(s)}.`,
        `c = √${fmt(s)} ≈ ${fmt(c)} m.`,
      ],
      respuestaTexto: `${fmt(c)} m`,
    };
  },
});

// ── PM-III-P02-A2 · Ecuación cuadrática de un terreno ───────────────────────
const terreno = definir({
  original: { w: 7, q: 5 },
  elegir: (rng) => ({ w: entero(rng, 3, 20), q: entero(rng, 1, 12) }),
  resolver: ({ w, q }) => {
    const A = w * (2 * w + q);
    const disc = q * q + 8 * A;
    const raiz = Math.sqrt(disc);
    const neg = (-q - raiz) / 4;
    return {
      problema: `Un agricultor tiene un terreno rectangular cuya longitud es ${q} ${q === 1 ? 'metro' : 'metros'} más que el doble del ancho. El área total del terreno es ${fmt(A)} m². Plantea la ecuación cuadrática (usa w para el ancho), resuélvela con la fórmula general y responde: ¿cuánto mide el ancho real del terreno?`,
      respuesta: w,
      unidades: 'm',
      tolerancia: 0,
      pasos: [
        `Sea w el ancho (en metros). Entonces la longitud es 2w + ${q}.`,
        `Plantea el área: w·(2w + ${q}) = ${fmt(A)} → 2w² + ${q}w − ${fmt(A)} = 0.`,
        `Identifica a = 2, b = ${q}, c = −${fmt(A)}. Discriminante: b² − 4ac = ${q * q} + ${fmt(8 * A)} = ${fmt(disc)}.`,
        `w = (−${q} ± √${fmt(disc)}) / 4 = (−${q} ± ${raiz}) / 4 → w = ${fmt(w)} o w = ${fmt(neg)}.`,
        `Descarta la negativa: el ancho es w = ${fmt(w)} m y el largo ${2 * w + q} m (verifica: ${w} × ${2 * w + q} = ${fmt(A)} m²).`,
      ],
      respuestaTexto: `${fmt(w)} m de ancho y ${2 * w + q} m de largo`,
    };
  },
});

// ── PM-III-P03-A2 · Discriminante de un cohete ──────────────────────────────
const discriminante = definir({
  original: { b: 30, c: 10 },
  elegir: (rng) => ({ b: elegir(rng, [10, 15, 20, 25, 30, 35, 40]), c: entero(rng, 1, 30) }),
  resolver: ({ b, c }) => {
    const D = b * b + 20 * c;
    return {
      problema: `Una empresa de pirotecnia modela la altura (en metros) de un cohete con h(t) = −5t² + ${b}t + ${c}, donde t es el tiempo en segundos. (a) Calcula el discriminante de la ecuación −5t² + ${b}t + ${c} = 0. ¿Cuántas veces toca el suelo el cohete?`,
      respuesta: D,
      tolerancia: 0,
      pasos: [
        `Al tocar el suelo h(t) = 0 → −5t² + ${b}t + ${c} = 0. Identifica a = −5, b = ${b}, c = ${c}.`,
        `Δ = b² − 4ac = ${fmt(b * b)} − 4(−5)(${c}) = ${fmt(b * b)} + ${fmt(20 * c)}.`,
        `Δ = ${fmt(D)} > 0 → dos raíces reales, pero solo la positiva tiene sentido físico: el cohete toca el suelo una vez.`,
      ],
      respuestaTexto: `Δ = ${fmt(D)}`,
    };
  },
});

// ── PM-III-P04-A2 · Volumen de un tanque cilíndrico ─────────────────────────
const tanqueCilindrico = definir({
  original: { r: 1.5, h: 3.2 },
  elegir: (rng) => ({ r: elegir(rng, [0.8, 1, 1.2, 1.5, 1.8, 2, 2.5]), h: elegir(rng, [2, 2.5, 3, 3.2, 3.5, 4]) }),
  resolver: ({ r, h }) => {
    const r2 = redondear(r * r, 4);
    const r2h = redondear(r2 * h, 4);
    const V = redondear(Math.PI * r * r * h, 2);
    const L = redondear(Math.PI * r * r * h * 1000, 0);
    return {
      problema: `Una comunidad rural construirá un tanque de almacenamiento de agua con forma cilíndrica. El radio de la base es ${fmt(r)} m y la altura es ${fmt(h)} m. (a) Calcula el volumen de agua que puede almacenar el tanque, en m³ (usa π ≈ 3.1416 y redondea a centésimos).`,
      respuesta: V,
      unidades: 'm³',
      tolerancia: 0.05,
      pasos: [
        `Volumen del cilindro: V = πr²h, con r = ${fmt(r)} m y h = ${fmt(h)} m.`,
        `V = π × ${fmt(r)}² × ${fmt(h)} = π × ${fmt(r2)} × ${fmt(h)} = π × ${fmt(r2h)}.`,
        `V ≈ ${fmt(V)} m³ (≈ ${fmt(L)} litros, porque 1 m³ = 1,000 L).`,
      ],
      respuestaTexto: `${fmt(V)} m³`,
    };
  },
});

// ── PM-III-P05-A2 · Altura de una torre por semejanza ───────────────────────
const torreSemejanza = definir({
  original: { e: 1.6, s: 0.8, k: 15.5 },
  elegir: (rng) => ({
    e: multiplo(rng, 1.5, 1.85, 0.05),
    s: elegir(rng, [0.6, 0.75, 0.8, 1, 1.2, 1.5]),
    k: elegir(rng, [8, 10, 12, 12.5, 15, 15.5, 16, 18, 20]),
  }),
  resolver: ({ e, s, k }) => {
    const S = redondear(s * k, 2);
    const H = redondear(e * k, 2);
    return {
      problema: `Sofía quiere conocer la altura de la torre del reloj de su pueblo. En un momento del día, Sofía (estatura = ${fmt(e, 2, 2)} m) proyecta una sombra de ${fmt(s, 2, 2)} m, mientras que la torre proyecta una sombra de ${fmt(S, 2, 2)} m. (a) Establece la proporción usando triángulos semejantes y calcula la altura de la torre.`,
      respuesta: H,
      unidades: 'm',
      tolerancia: 0.1,
      pasos: [
        'Los triángulos de Sofía y de la torre con sus sombras son semejantes (mismo ángulo del sol).',
        'Plantea la proporción: altura_torre / sombra_torre = altura_Sofía / sombra_Sofía.',
        `H / ${fmt(S)} = ${fmt(e)} / ${fmt(s)} → H = ${fmt(e)} × (${fmt(S)} / ${fmt(s)}) = ${fmt(e)} × ${fmt(k)}.`,
        `H = ${fmt(H)} m.`,
      ],
      respuestaTexto: `${fmt(H)} m`,
    };
  },
});

// ── PM-III-P05-A3 · Altura de un árbol por semejanza ────────────────────────
const arbolSemejanza = definir({
  original: { e: 1.72, s: 1.08, k: 6 },
  elegir: (rng) => ({
    e: multiplo(rng, 1.55, 1.85, 0.01),
    s: elegir(rng, [0.9, 1, 1.08, 1.2, 1.25, 1.5]),
    k: entero(rng, 3, 9),
  }),
  resolver: ({ e, s, k }) => {
    const S = redondear(s * k, 2);
    const H = redondear(e * k, 2);
    return {
      problema: `Durante una excursión, el grupo de Mateo quiere estimar la altura de un árbol sin escalarlo. Mateo mide ${fmt(e, 2, 2)} m y en ese momento proyecta una sombra de ${fmt(s, 2, 2)} m. El árbol proyecta una sombra de ${fmt(S, 2, 2)} m. (a) Calcula la altura del árbol usando semejanza de triángulos.`,
      respuesta: H,
      unidades: 'm',
      tolerancia: 0.05,
      pasos: [
        'Plantea la proporción: H_árbol / sombra_árbol = H_Mateo / sombra_Mateo.',
        `H / ${fmt(S)} = ${fmt(e)} / ${fmt(s)} → H = ${fmt(e)} × (${fmt(S)} / ${fmt(s)}).`,
        `La razón de semejanza es k = ${fmt(S)} / ${fmt(s)} = ${k}, así que H = ${fmt(e)} × ${k} = ${fmt(H)} m.`,
      ],
      respuestaTexto: `${fmt(H)} m`,
    };
  },
});

// ── PM-III-P06-A2 · Altura máxima de un tiro parabólico ─────────────────────
const tiroParabolico = definir({
  original: { a: 0.04, xv: 15 },
  elegir: (rng) => {
    for (let i = 0; i < 80; i++) {
      const a = elegir(rng, [0.02, 0.04, 0.05, 0.08, 0.1, 0.125, 0.2]);
      const xv = elegir(rng, [5, 8, 10, 12, 15, 20, 25]);
      const b = 2 * a * xv;
      const hmax = a * xv * xv;
      if (hmax >= 3 && hmax <= 15 && b <= 3 && esDecimalCorto(b, 2)) return { a, xv };
    }
    return { a: 0.04, xv: 15 };
  },
  resolver: ({ a, xv }) => {
    const b = redondear(2 * a * xv, 4);
    const t1 = redondear(a * xv * xv, 4);
    const t2 = redondear(b * xv, 4);
    const hmax = redondear(t2 - t1, 2);
    return {
      problema: `Un balón de fútbol es pateado desde el suelo y describe una trayectoria modelada por h(x) = ${poli([-a, b, 0])}, donde h es la altura en metros y x la distancia horizontal en metros. (a) ¿Cuál es la altura máxima que alcanza el balón?`,
      respuesta: hmax,
      unidades: 'm',
      tolerancia: 0.05,
      pasos: [
        `El vértice tiene coordenada x = −b/(2a). Con a = −${fmt(a)} y b = ${fmt(b)}: x_v = −${fmt(b)} / (2 × −${fmt(a)}) = ${fmt(xv)} m.`,
        `Sustituye x_v en h(x): h(${fmt(xv)}) = −${fmt(a)}(${fmt(xv)})² + ${fmt(b)}(${fmt(xv)}) = −${fmt(t1)} + ${fmt(t2)}.`,
        `Altura máxima: ${fmt(hmax)} m (a ${fmt(xv)} m de distancia horizontal).`,
      ],
      respuestaTexto: `${fmt(hmax)} m`,
    };
  },
});

// ── PM-III-P07-A2 · Ecuación lineal del artesano ────────────────────────────
const artesano = definir({
  original: { t: 150, m: 200, h: 5 },
  elegir: (rng) => ({ t: multiplo(rng, 100, 300, 25), m: multiplo(rng, 100, 500, 50), h: entero(rng, 2, 12) }),
  resolver: ({ t, m, h }) => {
    const total = t * h + m;
    return {
      problema: `Un artesano cobra ${pesos(t)} por hora de trabajo más ${pesos(m)} de materiales fijos. Si cobró ${pesos(total)} en total, ¿cuántas horas trabajó? Plantea y resuelve una ecuación lineal.`,
      respuesta: h,
      unidades: 'horas',
      tolerancia: 0,
      pasos: [
        `Sea h las horas: ${fmt(t)}h + ${fmt(m)} = ${fmt(total)}.`,
        `Resta ${fmt(m)} en ambos lados: ${fmt(t)}h = ${fmt(total - m)}.`,
        `Divide entre ${fmt(t)}: h = ${fmt(total - m)} / ${fmt(t)} = ${h} horas.`,
      ],
      respuestaTexto: `${h} horas`,
    };
  },
});

// ── PM-III-P08-A2 · Sistema de ecuaciones con monedas ───────────────────────
const monedas = definir({
  original: { a: 8, b: 4 },
  elegir: (rng) => ({ a: entero(rng, 2, 15), b: entero(rng, 2, 15) }),
  resolver: ({ a, b }) => {
    const N = a + b;
    const V = 5 * a + 10 * b;
    return {
      problema: `Juan tiene ${pesos(V)} en monedas de $5 y de $10. En total tiene ${N} monedas. ¿Cuántas monedas de $5 tiene? Plantea un sistema de dos ecuaciones y resuélvelo.`,
      respuesta: a,
      unidades: 'monedas de $5',
      tolerancia: 0,
      pasos: [
        `Sea a = monedas de $5 y b = monedas de $10: a + b = ${N}; 5a + 10b = ${V}.`,
        `Despeja a = ${N} − b y sustituye: 5(${N} − b) + 10b = ${V} → ${5 * N} + 5b = ${V}.`,
        `5b = ${V - 5 * N} → b = ${b} monedas de $10.`,
        `a = ${N} − ${b} = ${a} monedas de $5.`,
      ],
      respuestaTexto: `${a} monedas de $5 y ${b} de $10`,
    };
  },
});

// ── PM-III-P09-A2 · Inecuación del presupuesto ──────────────────────────────
const inecuacion = definir({
  original: { e: 30, c: 15, B: 120 },
  elegir: (rng) => {
    const e = multiplo(rng, 20, 80, 10);
    const c = multiplo(rng, 10, 40, 5);
    const n = entero(rng, 3, 12);
    const extra = multiplo(rng, 0, c - 5, 5);
    return { e, c, B: e + c * n + extra };
  },
  resolver: ({ e, c, B }) => {
    const resto = B - e;
    const cociente = resto / c;
    const n = Math.floor(cociente + 1e-9);
    const exacto = Number.isInteger(cociente);
    return {
      problema: `Una feria cobra ${pesos(e)} por la entrada más ${pesos(c)} por cada atracción. ¿Cuántas atracciones como máximo puede comprar Luisa si tiene ${pesos(B)}? Plantea y resuelve una inecuación.`,
      respuesta: n,
      unidades: 'atracciones',
      tolerancia: 0,
      pasos: [
        `Sea a el número de atracciones: ${e} + ${c}a ≤ ${B}.`,
        `Resta ${e} en ambos lados: ${c}a ≤ ${resto}.`,
        exacto
          ? `Divide entre ${c}: a ≤ ${n}. Luisa puede comprar como máximo ${n} atracciones.`
          : `Divide entre ${c}: a ≤ ${fmt(cociente, 2)}. Como a es un número entero, Luisa puede comprar como máximo ${n} atracciones.`,
      ],
      respuestaTexto: `${n} atracciones`,
    };
  },
});

// ── PM-III-P10-A2 · Tarifa de taxi (ecuación de la recta) ───────────────────
const taxi = definir({
  original: { km: 3 },
  elegir: (rng) => ({ km: multiplo(rng, 1, 15, 0.5) }),
  resolver: ({ km }) => {
    const x = redondear(km * 10, 1);
    const prod = redondear(1.07 * x, 2);
    const y = redondear(prod + 8.74, 2);
    return {
      problema: `La tarifa de un taxi (tarifa hipotética, inspirada en la de la Ciudad de México) se modela como y = 1.07·x + 8.74, donde y es el costo en pesos y x la distancia en cientos de metros. (c) Calcula el costo de un viaje de ${fmt(km)} km.`,
      respuesta: y,
      unidades: 'pesos',
      tolerancia: 0.01,
      pasos: [
        `Convierte la distancia a cientos de metros: ${fmt(km)} km = ${fmt(km * 1000)} m = ${fmt(x)} cientos de metros, así que x = ${fmt(x)}.`,
        `Sustituye: y = 1.07·(${fmt(x)}) + 8.74 = ${fmt(prod, 2, 2)} + 8.74.`,
        `y = $${fmt(y, 2, 2)}.`,
      ],
      respuestaTexto: `$${fmt(y, 2, 2)}`,
    };
  },
});

export const DEFINICIONES_PM_1A3: Record<string, Definicion> = {
  'PM-I-P01-A2': receta,
  'PM-I-P02-A2': descensoTemperatura,
  'PM-I-P04-A2': descuentos,
  'PM-I-P05-A2': obreros,
  'PM-I-P05-A6': reglaDeTres,
  'PM-I-P06-A2': piscina,
  'PM-I-P06-A6': notacionCientifica,
  'PM-I-P08-A2': valorPosicional,
  'PM-I-P09-A2': potencia,
  'PM-I-P09-A6': productoPotencias,
  'PM-I-P10-A2': jerarquia,
  'PM-I-P10-A6': agrupacion,
  'PM-II-P01-A2': sucesion,
  'PM-II-P09-A8': uniformidad,
  'PM-III-P01-A2': rampa,
  'PM-III-P02-A2': terreno,
  'PM-III-P03-A2': discriminante,
  'PM-III-P04-A2': tanqueCilindrico,
  'PM-III-P05-A2': torreSemejanza,
  'PM-III-P05-A3': arbolSemejanza,
  'PM-III-P06-A2': tiroParabolico,
  'PM-III-P07-A2': artesano,
  'PM-III-P08-A2': monedas,
  'PM-III-P09-A2': inecuacion,
  'PM-III-P10-A2': taxi,
};
