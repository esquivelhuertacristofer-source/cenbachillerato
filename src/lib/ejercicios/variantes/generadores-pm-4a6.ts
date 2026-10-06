/**
 * Generadores de variantes — Pensamiento Matemático IV, V y VI.
 * Cada uno conserva la situación y el procedimiento del ejercicio original.
 */
import {
  definir, elegir, entero, multiplo, redondear, fmt, par, poli, combinaciones, factorial,
  type Definicion, type RNG,
} from './motor';

const rad = (g: number) => (g * Math.PI) / 180;

// ═══════════════════════════════ PM-IV ══════════════════════════════════════

// ── PM-IV-P01-A2 · Enfriamiento de un café (función lineal) ──────────────────
const cafe = definir({
  original: { T0: 90, r: 6, t: 10 },
  elegir: (rng) => {
    for (let i = 0; i < 80; i++) {
      const T0 = entero(rng, 70, 95);
      const r = elegir(rng, [2, 3, 4, 5, 6]);
      const t = elegir(rng, [9, 10, 11, 12, 14]);
      if (T0 - 8 * r >= 25 && T0 - r * t >= 20) return { T0, r, t };
    }
    return { T0: 80, r: 4, t: 10 };
  },
  resolver: ({ T0, r, t }) => {
    const tabla = [0, 2, 4, 6, 8].map((x) => T0 - r * x);
    const T = T0 - r * t;
    return {
      problema: `Se registró la temperatura (en °C) de una taza de café en reposo: a los 0, 2, 4, 6 y 8 minutos marcó ${tabla.join(', ')} °C, respectivamente. Determina la regla algebraica T(t) y, con ella, responde el inciso (c): ¿cuál será la temperatura a los ${t} minutos?`,
      respuesta: T,
      unidades: '°C',
      tolerancia: 0.1,
      pasos: [
        'A cada tiempo le corresponde exactamente una temperatura: la tabla es una función.',
        `T disminuye ${2 * r} °C cada 2 minutos → tasa de cambio = −${r} °C por minuto. En t = 0, T = ${T0}. Regla: T(t) = ${T0} − ${r}t.`,
        `Sustituye t = ${t}: T(${t}) = ${T0} − ${r}(${t}) = ${T0} − ${r * t} = ${fmt(T)} °C.`,
      ],
      respuestaTexto: `${fmt(T)} °C`,
    };
  },
});

// ── PM-IV-P02-A2 · Altura máxima de una pelota ──────────────────────────────
const pelota = definir({
  original: { b: 20, c: 1 },
  elegir: (rng) => ({ b: elegir(rng, [10, 15, 20, 25, 30]), c: entero(rng, 2, 20) }),
  resolver: ({ b, c }) => {
    const tv = b / 10;
    const t1 = redondear(5 * tv * tv, 4);
    const t2 = redondear(b * tv, 4);
    const h = redondear(-t1 + t2 + c, 2);
    return {
      problema: `Desde la azotea de un edificio en Guadalajara se lanza verticalmente hacia arriba una pelota. Su altura (en metros sobre el suelo) en función del tiempo (en segundos) es h(t) = −5t² + ${b}t + ${c}. (b) ¿Cuál es la altura máxima?`,
      respuesta: h,
      unidades: 'm',
      tolerancia: 0.05,
      pasos: [
        `El vértice de f(t) = at² + bt + c está en t_v = −b / (2a). Identifica a = −5, b = ${b}.`,
        `t_v = −${b} / (2 × (−5)) = −${b} / (−10) = ${fmt(tv)} s.`,
        `Sustituye t = ${fmt(tv)} en h(t): h(${fmt(tv)}) = −5(${fmt(tv * tv)}) + ${b}(${fmt(tv)}) + ${c} = −${fmt(t1)} + ${fmt(t2)} + ${c} = ${fmt(h)} m.`,
      ],
      respuestaTexto: `${fmt(h)} m`,
    };
  },
});

// ── PM-IV-P03-A2 · Altura de un árbol con tangente ──────────────────────────
const PARQUES = ['el Bosque de Chapultepec', 'los Viveros de Coyoacán', 'el Parque Fundidora', 'el Bosque Los Colomos'];
const arbolTangente = definir({
  original: { e: 1.7, d: 15, ang: 35, parque: 0 },
  elegir: (rng) => ({
    e: multiplo(rng, 1.5, 1.85, 0.05),
    d: entero(rng, 8, 30),
    ang: elegir(rng, [25, 30, 35, 40, 45, 50, 55, 60]),
    parque: entero(rng, 0, PARQUES.length - 1),
  }),
  resolver: ({ e, d, ang, parque }) => {
    const tan = redondear(Math.tan(rad(ang)), 4);
    const alt = redondear(d * tan, 4);
    const total = redondear(alt + e, 2);
    return {
      problema: `Daniela tiene ${fmt(e, 2, 2)} m de estatura (del suelo a sus ojos). Está parada a ${d} metros de la base de un árbol en ${PARQUES[parque]}. Al levantar la vista hacia la cima, forma un ángulo de elevación de ${ang}°. (d) ¿Cuánto mide el árbol desde el suelo? (Usa tan ${ang}° ≈ ${fmt(tan, 4, 4)}.)`,
      respuesta: total,
      unidades: 'm',
      tolerancia: 0.05,
      pasos: [
        `La tangente relaciona el cateto opuesto (altura sobre los ojos) con el adyacente (distancia): tan(${ang}°) = altura_sobre_ojos / ${d}.`,
        `Despeja: altura_sobre_ojos = ${d} × tan(${ang}°) = ${d} × ${fmt(tan, 4, 4)} = ${fmt(alt)} m.`,
        `Altura total = ${fmt(alt)} + ${fmt(e)} = ${fmt(total)} m.`,
      ],
      respuestaTexto: `${fmt(total)} m`,
    };
  },
});

// ── PM-IV-P05-A2 · Ley de cosenos en un terreno ─────────────────────────────
const LUGARES = ['Oaxaca', 'Zacatecas', 'Morelia', 'San Luis Potosí', 'Tlaxcala'];
const leyCosenos = definir({
  original: { a: 80, b: 95, C: 42, lugar: 0 },
  elegir: (rng) => ({
    a: multiplo(rng, 40, 120, 5),
    b: multiplo(rng, 40, 120, 5),
    C: elegir(rng, [30, 35, 40, 42, 45, 50, 55, 60, 65, 70, 75, 80, 100, 110, 120]),
    lugar: entero(rng, 0, LUGARES.length - 1),
  }),
  resolver: ({ a, b, C, lugar }) => {
    const cos = redondear(Math.cos(rad(C)), 4);
    const dosab = 2 * a * b;
    const prod = redondear(dosab * cos, 4);
    const c2 = redondear(a * a + b * b - prod, 4);
    const c = redondear(Math.sqrt(c2), 2);
    return {
      problema: `Un terreno triangular en las afueras de ${LUGARES[lugar]} tiene dos lados medidos con cinta métrica: a = ${a} m y b = ${b} m. El ángulo C entre esos dos lados mide ${C}°. (b) Calcula el lado c con la Ley de Cosenos. (Usa cos ${C}° ≈ ${fmt(cos, 4, 4)}.)`,
      respuesta: c,
      unidades: 'm',
      tolerancia: 0.5,
      pasos: [
        `Ley de Cosenos: c² = a² + b² − 2·a·b·cos(C), con a = ${a}, b = ${b}, C = ${C}°.`,
        `c² = ${fmt(a * a)} + ${fmt(b * b)} − ${fmt(dosab)} × ${par(cos)} = ${fmt(a * a + b * b)} − ${par(prod)}.`,
        `c² = ${fmt(c2)}; c = √${fmt(c2)} ≈ ${fmt(c)} m.`,
      ],
      respuestaTexto: `${fmt(c)} m`,
    };
  },
});

// ── PM-IV-P06-A2 · Distancia entre dos repetidoras ──────────────────────────
const TERNAS: [number, number][] = [[3, 4], [4, 3], [6, 8], [8, 6], [5, 12], [12, 5], [9, 12], [8, 15]];
const distanciaPuntos = definir({
  original: { x1: 2, y1: -1, dx: 6, dy: 8 },
  elegir: (rng) => {
    const [dx, dy] = elegir(rng, TERNAS);
    return { x1: entero(rng, -6, 6), y1: entero(rng, -6, 6), dx: dx * elegir(rng, [1, -1]), dy: dy * elegir(rng, [1, -1]) };
  },
  resolver: ({ x1, y1, dx, dy }) => {
    const x2 = x1 + dx;
    const y2 = y1 + dy;
    const s = dx * dx + dy * dy;
    const d = Math.sqrt(s);
    return {
      problema: `Dos técnicos de una empresa de telecomunicaciones colocan repetidoras de señal en la Ciudad de México, en las coordenadas (en kilómetros desde un punto central) A(${fmt(x1)}, ${fmt(y1)}) y B(${fmt(x2)}, ${fmt(y2)}). (a) Calcula la distancia entre las dos repetidoras.`,
      respuesta: d,
      unidades: 'km',
      tolerancia: 0,
      pasos: [
        'd = √((x₂ − x₁)² + (y₂ − y₁)²).',
        `d = √((${fmt(x2)} − ${par(x1)})² + (${fmt(y2)} − ${par(y1)})²) = √(${par(dx)}² + ${par(dy)}²).`,
        `d = √(${dx * dx} + ${dy * dy}) = √${s} = ${fmt(d)} km.`,
      ],
      respuestaTexto: `${fmt(d)} km`,
    };
  },
});

// ── PM-IV-P08-A2 · Profundidad de una antena parabólica ─────────────────────
const antena = definir({
  original: { a: 0.25, x1: 1, x2: 2 },
  elegir: (rng) => {
    const x1 = elegir(rng, [1, 2]);
    let x2 = elegir(rng, [1.5, 2, 2.5, 3]);
    if (x2 === x1) x2 = 3;
    return { a: elegir(rng, [0.1, 0.125, 0.2, 0.25, 0.3, 0.4, 0.5]), x1, x2 };
  },
  resolver: ({ a, x1, x2 }) => {
    const y1 = redondear(a * x1 * x1, 4);
    const y2 = redondear(a * x2 * x2, 4);
    return {
      problema: `Una antena tiene forma de parábola y = a·x² (vértice en el origen, abierta hacia arriba, x e y en metros) y pasa por el punto (${fmt(x1)}, ${fmt(y1)}). Halla a y, con esa ecuación, responde el inciso (b): ¿cuánto sube la antena a ${fmt(x2)} m del eje? (y cuando x = ${fmt(x2)}).`,
      respuesta: y2,
      unidades: 'm',
      tolerancia: 0.01,
      pasos: [
        `Sustituye (${fmt(x1)}, ${fmt(y1)}) en y = a·x²: ${fmt(y1)} = a·(${fmt(x1)})² ⇒ a = ${fmt(y1)} / ${fmt(x1 * x1)} = ${fmt(a)}.`,
        `La ecuación de la antena es y = ${fmt(a)}·x².`,
        `Para x = ${fmt(x2)}: y = ${fmt(a)}·(${fmt(x2)})² = ${fmt(a)} × ${fmt(x2 * x2)} = ${fmt(y2)} m.`,
      ],
      respuestaTexto: `${fmt(y2)} m`,
    };
  },
});

// ═══════════════════════════════ PM-V ═══════════════════════════════════════

// ── PM-V-P01-A2 · Límite 0/0 por factorización ──────────────────────────────
const limiteIndeterminado = definir({
  original: { a: 3 },
  elegir: (rng) => ({ a: entero(rng, 2, 12) }),
  resolver: ({ a }) => {
    const a2 = a * a;
    return {
      problema: `(b) Resuelve la indeterminación: lim(x→${a}) (x² − ${a2})/(x − ${a}).`,
      respuesta: 2 * a,
      tolerancia: 0,
      pasos: [
        `Sustituye x = ${a}: (${a2} − ${a2})/(${a} − ${a}) = 0/0, forma indeterminada.`,
        `Factoriza el numerador (diferencia de cuadrados): x² − ${a2} = (x + ${a})(x − ${a}). Cancela (x − ${a}).`,
        `lim(x→${a}) (x + ${a}) = ${a} + ${a} = ${2 * a}.`,
      ],
      respuestaTexto: String(2 * a),
    };
  },
});

// ── PM-V-P02-A2 · Reparar una discontinuidad evitable ───────────────────────
const discontinuidad = definir({
  original: { a: 2 },
  elegir: (rng) => ({ a: entero(rng, 1, 10) }),
  resolver: ({ a }) => {
    const a2 = a * a;
    return {
      problema: `Analiza la función f(x) = (x² − ${a2})/(x − ${a}), que no está definida en x = ${a}. (c) La discontinuidad es evitable: ¿qué valor debe tomar la función reparada F en x = ${a} para que sea continua?`,
      respuesta: 2 * a,
      tolerancia: 0,
      pasos: [
        `f(${a}) = (${a2} − ${a2})/(${a} − ${a}) = 0/0: no está definida, así que f no es continua en x = ${a}.`,
        `Calcula el límite: lim(x→${a}) (x + ${a})(x − ${a})/(x − ${a}) = lim(x→${a}) (x + ${a}) = ${2 * a}. Existe y es finito: discontinuidad evitable.`,
        `Se repara definiendo F(x) = (x² − ${a2})/(x − ${a}) si x ≠ ${a}, y F(${a}) = ${2 * a}.`,
      ],
      respuestaTexto: `F(${a}) = ${2 * a}`,
    };
  },
});

// ── PM-V-P03-A2 · Pendiente de la tangente con la definición ────────────────
const tangenteDefinicion = definir({
  original: { k: 0, a: 2 },
  elegir: (rng) => ({ k: entero(rng, -6, 6), a: entero(rng, -4, 5) }),
  resolver: ({ k, a }) => {
    const f = poli([1, k, 0]);
    const m = 2 * a + k;
    const fa = a * a + k * a;
    const b = fa - m * a;
    const kTxt = k === 0 ? '' : k > 0 ? ` + ${k}` : ` − ${-k}`;
    const desarrollo = k === 0
      ? '[(x + h)² − x²] / h = (2xh + h²) / h = 2x + h'
      : `[(x + h)² ${k > 0 ? '+' : '−'} ${Math.abs(k)}(x + h) − (${f})] / h = (2xh + h²${k > 0 ? ' + ' : ' − '}${Math.abs(k)}h) / h = 2x + h${kTxt}`;
    return {
      problema: `Usando la definición de derivada (límite del cociente de Newton), calcula la pendiente de la recta tangente a f(x) = ${f} en el punto donde x = ${fmt(a)}.`,
      respuesta: m,
      tolerancia: 0,
      pasos: [
        `Cociente de Newton: ${desarrollo}.`,
        `Cuando h → 0: f′(x) = 2x${kTxt}.`,
        `Pendiente en x = ${fmt(a)}: m = f′(${fmt(a)}) = 2(${fmt(a)})${kTxt} = ${fmt(m)}. La tangente pasa por (${fmt(a)}, ${fmt(fa)}): y = ${poli([m, b])}.`,
      ],
      respuestaTexto: `m = ${fmt(m)}`,
    };
  },
});

// ── PM-V-P04-A2 · Regla del producto evaluada ───────────────────────────────
const reglaProducto = definir({
  original: { p: 1, q: 3, r: 2, x0: 1 },
  elegir: (rng) => ({ p: entero(rng, 1, 6), q: entero(rng, 2, 6), r: entero(rng, 1, 6), x0: elegir(rng, [-2, -1, 1, 2, 3]) }),
  resolver: ({ p, q, r, x0 }) => {
    const coefs = [3 * q, -2 * r, q * p];
    const v = coefs[0]! * x0 * x0 + coefs[1]! * x0 + coefs[2]!;
    return {
      problema: `Deriva g(x) = (x² + ${p})(${q}x − ${r}) aplicando la regla del producto y evalúa la derivada en x = ${fmt(x0)}: ¿cuánto vale g′(${fmt(x0)})?`,
      respuesta: v,
      tolerancia: 0,
      pasos: [
        `Regla del producto: (fg)′ = f′g + fg′, con f = x² + ${p} (f′ = 2x) y g = ${q}x − ${r} (g′ = ${q}).`,
        `g′(x) = 2x(${q}x − ${r}) + (x² + ${p})(${q}) = ${poli([2 * q, -2 * r, 0])} + ${poli([q, 0, q * p])} = ${poli(coefs)}.`,
        `g′(${fmt(x0)}) = ${coefs[0]}(${fmt(x0)})² ${coefs[1]! < 0 ? '−' : '+'} ${Math.abs(coefs[1]!)}(${fmt(x0)}) + ${coefs[2]} = ${fmt(v)}.`,
      ],
      respuestaTexto: `g′(${fmt(x0)}) = ${fmt(v)}`,
    };
  },
});

// ── PM-V-P05-A2 · Derivada de ln(x² + k) con la regla de la cadena ──────────
const PARES_LN: { k: number; x0: number }[] = [];
for (let x0 = 1; x0 <= 5; x0++) {
  for (let k = 1; k <= 24; k++) {
    if ((200 * x0) % (x0 * x0 + k) === 0) PARES_LN.push({ k, x0 });
  }
}
const derivadaLn = definir({
  original: { k: 1, x0: 1 },
  elegir: (rng) => elegir(rng, PARES_LN),
  resolver: ({ k, x0 }) => {
    const den = x0 * x0 + k;
    const v = redondear((2 * x0) / den, 2);
    return {
      problema: `Calcula la derivada de h(x) = ln(x² + ${k}) con la regla de la cadena y evalúala en x = ${x0}: ¿cuánto vale h′(${x0})?`,
      respuesta: v,
      tolerancia: 0.01,
      pasos: [
        `Regla de la cadena: función exterior ln(u) (derivada 1/u), función interior u = x² + ${k} (derivada 2x).`,
        `h′(x) = (1/(x² + ${k})) · 2x = 2x/(x² + ${k}).`,
        `h′(${x0}) = 2(${x0})/(${x0 * x0} + ${k}) = ${2 * x0}/${den} = ${fmt(v)}.`,
      ],
      respuestaTexto: `h′(${x0}) = ${fmt(v)}`,
    };
  },
});

// ── PM-V-P06-A2 · Mínimo local de una cúbica ────────────────────────────────
/** Sustitución legible de x en un polinomio: sustituir([1, -3, -9, 5], 3) → «(3)³ − 3(3)² − 9(3) + 5». */
function sustituir(coefs: number[], x: number): string {
  const grado = coefs.length - 1;
  const partes: string[] = [];
  coefs.forEach((c, i) => {
    if (c === 0) return;
    const g = grado - i;
    const abs = Math.abs(c);
    const cuerpo = g === 0 ? fmt(abs) : `${abs === 1 ? '' : fmt(abs)}(${fmt(x)})${g === 1 ? '' : g === 2 ? '²' : '³'}`;
    partes.push(partes.length === 0 ? `${c < 0 ? '−' : ''}${cuerpo}` : `${c < 0 ? '−' : '+'} ${cuerpo}`);
  });
  return partes.join(' ');
}
const factorX = (r: number) => (r === 0 ? 'x' : r < 0 ? `(x + ${-r})` : `(x − ${r})`);
const extremosCubica = definir({
  original: { p: -1, m: 2, d: 5 },
  elegir: (rng) => ({ p: entero(rng, -4, 2), m: entero(rng, 1, 3), d: entero(rng, -10, 10) }),
  resolver: ({ p, m, d }) => {
    const q = p + 2 * m;
    const B = -3 * (p + m);
    const C = 3 * p * q;
    const f = (x: number) => x ** 3 + B * x * x + C * x + d;
    const fq = f(q);
    const f2q = 6 * q + 2 * B;
    return {
      problema: `Para la función f(x) = ${poli([1, B, C, d])}, encuentra los puntos críticos, clasifícalos con el criterio de la segunda derivada y responde: ¿cuál es el valor del mínimo local, f(x), de la función?`,
      respuesta: fq,
      tolerancia: 0,
      pasos: [
        `f′(x) = ${poli([3, 2 * B, C])} = 3${q === 0 ? `x${factorX(p)}` : `${factorX(p)}${factorX(q)}`}. Igualando a cero: x = ${fmt(p)} y x = ${fmt(q)}.`,
        `f″(x) = ${poli([6, 2 * B])}. En x = ${fmt(p)}: f″(${fmt(p)}) = ${fmt(6 * p + 2 * B)} < 0 → máximo local. En x = ${fmt(q)}: f″(${fmt(q)}) = ${fmt(f2q)} > 0 → mínimo local.`,
        `f(${fmt(q)}) = ${sustituir([1, B, C, d], q)} = ${fmt(fq)}. Mínimo local en (${fmt(q)}, ${fmt(fq)}).`,
      ],
      respuestaTexto: `${fmt(fq)} (en x = ${fmt(q)})`,
    };
  },
});

// ── PM-V-P07-A2 · Optimización de una caja cilíndrica sin tapa ──────────────
const optimizacion = definir({
  original: { V: 1000 },
  elegir: (rng) => ({ V: elegir(rng, [250, 500, 750, 1500, 2000, 3000]) }),
  resolver: ({ V }) => {
    const cociente = V / Math.PI;
    const r = redondear(Math.cbrt(cociente), 2);
    return {
      problema: `Una empresa fabricante de envases (como los que produce Vitro en Monterrey) quiere construir una caja cilíndrica sin tapa con un volumen de ${fmt(V)} cm³. ¿Cuál debe ser el radio r para minimizar el material usado (área de la base + área lateral)? Expresa r con 2 decimales.`,
      respuesta: r,
      unidades: 'cm',
      tolerancia: 0.01,
      pasos: [
        `Área: A = πr² + 2πrh. Restricción: πr²h = ${fmt(V)}, así que h = ${fmt(V)}/(πr²).`,
        `En una variable: A(r) = πr² + 2πr · ${fmt(V)}/(πr²) = πr² + ${fmt(2 * V)}/r.`,
        `A′(r) = 2πr − ${fmt(2 * V)}/r² = 0 → r³ = ${fmt(V)}/π ≈ ${fmt(cociente, 2)}.`,
        `r = ∛(${fmt(V)}/π) ≈ ${fmt(r, 2, 2)} cm, y h = ${fmt(V)}/(πr²) ≈ ${fmt(r, 2, 2)} cm (sin tapa, el óptimo cumple h = r).`,
      ],
      respuestaTexto: `r ≈ ${fmt(r, 2, 2)} cm (h ≈ ${fmt(r, 2, 2)} cm)`,
    };
  },
});

// ── PM-V-P08-A2 · Linealización de una raíz cuadrada ────────────────────────
const linealizacion = definir({
  original: { a: 3, delta: 0.04 },
  elegir: (rng) => ({ a: entero(rng, 2, 10), delta: elegir(rng, [0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.1, 0.12, 0.2]) }),
  resolver: ({ a, delta }) => {
    const base = a * a;
    const x = redondear(base + delta, 4);
    const inc = delta / (2 * a);
    const L = redondear(a + inc, 4);
    return {
      problema: `Usa la linealización (aproximación lineal) para estimar √(${fmt(x)}) sin calculadora. Usa f(x) = √x con punto base a = ${base} y redondea a cuatro decimales.`,
      respuesta: L,
      tolerancia: 0.0005,
      pasos: [
        `f(x) = √x, f′(x) = 1/(2√x). En a = ${base}: f(${base}) = ${a}, f′(${base}) = 1/${2 * a}.`,
        `Linealización: L(x) = ${a} + (1/${2 * a})(x − ${base}).`,
        `Para x = ${fmt(x)}: L(${fmt(x)}) = ${a} + ${fmt(delta)}/${2 * a} = ${a} + ${fmt(inc, 4)} ≈ ${fmt(L)}.`,
      ],
      respuestaTexto: `√(${fmt(x)}) ≈ ${fmt(L)}`,
    };
  },
});

// ── PM-V-P09-A2 · Extremos de f(x) = x³ − 3m²x ──────────────────────────────
const extremoImpar = definir({
  original: { m: 1, tipo: 'max' as 'max' | 'min' },
  elegir: (rng) => ({ m: entero(rng, 1, 5), tipo: elegir(rng, ['max', 'min'] as const) }),
  resolver: ({ m, tipo }) => {
    const k = 3 * m * m;
    const x = tipo === 'max' ? -m : m;
    const y = x ** 3 - k * x;
    const nombre = tipo === 'max' ? 'máximo' : 'mínimo';
    return {
      problema: `Dada la función f(x) = ${poli([1, 0, -k, 0])}, analiza su gráfica. (c) EXTREMOS: la función sube, baja y vuelve a subir. ¿Cuánto vale f en su ${nombre} local?`,
      respuesta: y,
      tolerancia: 0,
      pasos: [
        `Deriva: f′(x) = ${poli([3, 0, -k])} = 0 ⇒ x² = ${m * m} ⇒ x = ±${m}.`,
        `f″(x) = 6x: en x = −${m} es negativa (máximo local) y en x = ${m} es positiva (mínimo local).`,
        `f(${fmt(x)}) = (${fmt(x)})³ − ${k}(${fmt(x)}) = ${fmt(x ** 3)} ${-k * x < 0 ? '−' : '+'} ${fmt(Math.abs(k * x))} = ${fmt(y)}. El ${nombre} local está en (${fmt(x)}, ${fmt(y)}).`,
      ],
      respuestaTexto: `${fmt(y)} (en x = ${fmt(x)})`,
    };
  },
});

// ── PM-V-P10-A2 · Distancia como área bajo v(t) = k·t ───────────────────────
const integralDistancia = definir({
  original: { k: 2, T: 4 },
  elegir: (rng) => ({ k: entero(rng, 1, 6), T: entero(rng, 2, 12) }),
  resolver: ({ k, T }) => {
    const vT = k * T;
    const area = redondear((k * T * T) / 2, 2);
    const anti = `${k === 2 ? '' : fmt(k / 2)}t²`;
    return {
      problema: `Un objeto parte del reposo y se mueve con velocidad v(t) = ${k === 1 ? '' : k}t (en m/s, con t en segundos). (b) Calcula la distancia recorrida entre t = 0 y t = ${T} s como la integral ∫₀^${T} ${k === 1 ? '' : k}t dt.`,
      respuesta: area,
      unidades: 'm',
      tolerancia: 0.01,
      pasos: [
        'El área bajo la gráfica velocidad–tiempo es la distancia recorrida.',
        `Como triángulo: base = ${T} s, altura = v(${T}) = ${k}·${T} = ${vT} m/s, área = ½·${T}·${vT} = ${fmt(area)} m.`,
        `Con antiderivada: ∫ ${k === 1 ? '' : k}t dt = ${anti}, así que ∫₀^${T} = ${k === 2 ? '' : fmt(k / 2)}(${T}² − 0²) = ${fmt(area)} m.`,
      ],
      respuestaTexto: `${fmt(area)} m`,
    };
  },
});

// ═══════════════════════════════ PM-VI ══════════════════════════════════════

// ── PM-VI-P02-A2 · Frecuencia relativa acumulada ────────────────────────────
const INTERVALOS = [
  { nombre: '50-59', valores: [50, 55] },
  { nombre: '60-69', valores: [60, 65] },
  { nombre: '70-79', valores: [70, 75] },
  { nombre: '80-89', valores: [80, 85] },
  { nombre: '90-100', valores: [90, 95, 100] },
];
const DATOS_ORIGINALES_FREC = [55, 60, 65, 65, 70, 70, 70, 75, 75, 75, 75, 80, 80, 80, 85, 85, 90, 90, 95, 100];
function generarCalificaciones(rng: RNG): number[] {
  const n = elegir(rng, [20, 25]);
  const conteos = [1, 1, 1, 1, 1];
  const pesosIntervalo = [1, 2, 3, 3, 2];
  const totalPeso = pesosIntervalo.reduce((s, x) => s + x, 0);
  for (let i = 5; i < n; i++) {
    let u = rng() * totalPeso;
    let j = 0;
    while (u >= pesosIntervalo[j]!) { u -= pesosIntervalo[j]!; j++; }
    conteos[j]!++;
  }
  return conteos.flatMap((c, j) => Array.from({ length: c }, () => elegir(rng, INTERVALOS[j]!.valores))).sort((x, y) => x - y);
}
const intervaloDe = (v: number) => (v >= 90 ? 4 : Math.floor((v - 50) / 10));

const frecuenciaAcumulada = definir({
  original: { datos: DATOS_ORIGINALES_FREC, k: 4 },
  elegir: (rng) => ({ datos: generarCalificaciones(rng), k: entero(rng, 1, 3) }),
  resolver: ({ datos, k }) => {
    const n = datos.length;
    const f = [0, 0, 0, 0, 0];
    for (const v of datos) f[intervaloDe(v)]!++;
    const acum = f.map((_, i) => f.slice(0, i + 1).reduce((s, x) => s + x, 0));
    const pct = redondear((acum[k]! / n) * 100, 2);
    return {
      problema: `Las calificaciones de ${n} alumnos en un examen de matemáticas son: ${datos.join(', ')}. Organiza los datos en 5 intervalos de clase (50-59, 60-69, 70-79, 80-89, 90-100) y calcula la frecuencia relativa acumulada hasta el intervalo ${INTERVALOS[k]!.nombre}, expresada como porcentaje del total.`,
      respuesta: pct,
      unidades: '%',
      tolerancia: 0,
      pasos: [
        `Frecuencias absolutas: ${INTERVALOS.map((it, i) => `[${it.nombre}] = ${f[i]}`).join('; ')}. Suma: ${f.join(' + ')} = ${n}.`,
        `Frecuencias relativas: ${INTERVALOS.map((it, i) => `[${it.nombre}] = ${f[i]}/${n} = ${fmt((f[i]! / n) * 100)} %`).join('; ')}.`,
        `Frecuencias absolutas acumuladas: ${INTERVALOS.map((it, i) => `[${it.nombre}] = ${acum[i]}`).join('; ')}.`,
        `Frecuencia relativa acumulada hasta ${INTERVALOS[k]!.nombre}: ${acum[k]}/${n} = ${fmt(acum[k]! / n)} = ${fmt(pct)} %.`,
      ],
      respuestaTexto: `${fmt(pct)} %`,
    };
  },
});

// ── PM-VI-P03-A2 · Mediana de salarios ──────────────────────────────────────
const SALARIOS_ORIGINALES = [6500, 7200, 7800, 8000, 8500, 9000, 10000, 12000, 45000];
const medianaSalarios = definir({
  original: { s: SALARIOS_ORIGINALES },
  elegir: (rng) => {
    const n = elegir(rng, [7, 9, 11]);
    const tipicos = Array.from({ length: n - 1 }, () => multiplo(rng, 6000, 14000, 100));
    return { s: [...tipicos, multiplo(rng, 30000, 60000, 1000)].sort((x, y) => x - y) };
  },
  resolver: ({ s }) => {
    const n = s.length;
    const suma = s.reduce((a, b) => a + b, 0);
    const media = redondear(suma / n, 2);
    const pos = (n + 1) / 2;
    const med = s[pos - 1]!;
    const max = s[n - 1]!;
    return {
      problema: `Los salarios mensuales (en pesos) de ${n} empleados de una empresa son: ${s.map((x) => fmt(x)).join('; ')}. Calcula la media aritmética y la mediana, y determina cuál representa mejor el salario típico. Para calificar, escribe la mediana.`,
      respuesta: med,
      unidades: 'pesos',
      tolerancia: 0,
      pasos: [
        `Suma todos los salarios: ${fmt(suma)} pesos. Media = ${fmt(suma)} / ${n} = ${fmt(media, 2)} pesos.`,
        `Para la mediana, los datos ya están ordenados. n = ${n} (impar): la mediana es el dato en la posición (${n} + 1)/2 = ${pos}.`,
        `El dato ${pos}.º es ${fmt(med)} pesos. Mediana = ${fmt(med)} pesos: representa mejor al empleado típico, porque el salario de ${fmt(max)} jala la media hacia arriba.`,
      ],
      respuestaTexto: `Mediana = ${fmt(med)} pesos`,
    };
  },
});

// ── PM-VI-P04-A2 · Desviación estándar de un grupo ──────────────────────────
const SIMETRICAS: [number, number][] = [[3, 1], [6, 2], [9, 3], [12, 4], [15, 5], [13, 9], [18, 6]];
const desviacionEstandar = definir({
  original: { datos: [60, 70, 75, 80, 90] },
  elegir: (rng) => {
    const mu = entero(rng, 62, 82);
    for (let i = 0; i < 400; i++) {
      const d = Array.from({ length: 4 }, () => entero(rng, -18, 18));
      const ultimo = -d.reduce((s, x) => s + x, 0);
      d.push(ultimo);
      const ss = d.reduce((s, x) => s + x * x, 0);
      const s2 = ss / 5;
      const sigma = Math.sqrt(s2);
      const datos = d.map((x) => mu + x);
      if (Number.isInteger(sigma) && sigma >= 2 && datos.every((v) => v >= 0 && v <= 100)) return { datos: datos.sort((x, y) => x - y) };
    }
    const [a, b] = elegir(rng, SIMETRICAS);
    return { datos: [mu - a, mu - b, mu, mu + b, mu + a] };
  },
  resolver: ({ datos }) => {
    const suma = datos.reduce((s, x) => s + x, 0);
    const mu = suma / datos.length;
    const desv = datos.map((x) => x - mu);
    const cuad = desv.map((x) => x * x);
    const ss = cuad.reduce((s, x) => s + x, 0);
    const v = redondear(ss / datos.length, 4);
    const sigma = redondear(Math.sqrt(v), 2);
    return {
      problema: `Un grupo de 5 estudiantes obtuvo estas calificaciones: ${datos.join(', ')}. Calcula la varianza y la desviación estándar (poblacional) del grupo para determinar qué tan dispersas están sus calificaciones. Para calificar, escribe la desviación estándar.`,
      respuesta: sigma,
      unidades: 'puntos',
      tolerancia: 0.1,
      pasos: [
        `Media: (${datos.join(' + ')}) / 5 = ${fmt(suma)} / 5 = ${fmt(mu)}.`,
        `Desviaciones respecto a la media: ${datos.map((x, i) => `(${x} − ${fmt(mu)}) = ${fmt(desv[i]!)}`).join('; ')}.`,
        `Cuadrados: ${cuad.map((x) => fmt(x)).join('; ')}. Suma: ${fmt(ss)}.`,
        `Varianza poblacional: s² = ${fmt(ss)} / 5 = ${fmt(v)}.`,
        `Desviación estándar: s = √${fmt(v)} = ${fmt(sigma)} puntos.`,
      ],
      respuestaTexto: `${fmt(sigma)} puntos`,
    };
  },
});

// ── PM-VI-P06-A2 · Teorema de Bayes en una prueba diagnóstica ───────────────
const bayes = definir({
  original: { sens: 90, esp: 95, prev: 10 },
  elegir: (rng) => ({ sens: elegir(rng, [80, 85, 90, 95, 98]), esp: elegir(rng, [85, 90, 95, 98]), prev: elegir(rng, [2, 5, 8, 10, 12, 15, 20]) }),
  resolver: ({ sens, esp, prev }) => {
    const p = prev / 100;
    const s = sens / 100;
    const e = esp / 100;
    const verdaderos = redondear(p * s, 4);
    const falsos = redondear((1 - p) * (1 - e), 4);
    const total = redondear(verdaderos + falsos, 4);
    const vpp = redondear((verdaderos / total) * 100, 2);
    return {
      problema: `Una prueba de detección de diabetes tiene sensibilidad del ${sens} % (P(positivo|diabetes) = ${fmt(s)}) y especificidad del ${esp} % (P(negativo|sin diabetes) = ${fmt(e)}). En una población, la prevalencia de diabetes es del ${prev} % (P(diabetes) = ${fmt(p)}). Usando el teorema de Bayes, calcula el Valor Predictivo Positivo (VPP): la probabilidad de tener diabetes dado que la prueba salió positiva, en porcentaje.`,
      respuesta: vpp,
      unidades: '%',
      tolerancia: 0.5,
      pasos: [
        `P(positivo y diabetes) = P(diabetes) × P(positivo|diabetes) = ${fmt(p)} × ${fmt(s)} = ${fmt(verdaderos)}.`,
        `P(positivo y sin diabetes) = P(sin diabetes) × P(positivo|sin diabetes) = ${fmt(1 - p)} × ${fmt(1 - e)} = ${fmt(falsos)}.`,
        `P(positivo total) = ${fmt(verdaderos)} + ${fmt(falsos)} = ${fmt(total)}.`,
        `VPP = ${fmt(verdaderos)} / ${fmt(total)} = ${fmt(verdaderos / total)} → ${fmt(vpp)} %.`,
      ],
      respuestaTexto: `${fmt(vpp)} %`,
    };
  },
});

// ── PM-VI-P07-A2 · Muestreo estratificado ───────────────────────────────────
const ORDINALES = ['1.º', '2.º', '3.º', '4.º'];
const estratificado = definir({
  original: { conteos: [250, 210, 190, 150], f: 0.1, g: 0 },
  elegir: (rng) => {
    const f = elegir(rng, [0.05, 0.1, 0.2, 0.25]);
    const unidad = Math.round(1 / f);
    const conteos = [0, 0, 0, 0].map(() => unidad * entero(rng, Math.ceil(100 / unidad), Math.floor(320 / unidad)));
    return { conteos, f, g: entero(rng, 0, 3) };
  },
  resolver: ({ conteos, f, g }) => {
    const N = conteos.reduce((s, x) => s + x, 0);
    const n = Math.round(N * f);
    const muestra = conteos.map((c) => Math.round(c * f));
    const v = muestra[g]!;
    return {
      problema: `Quieres encuestar a estudiantes de tu escuela sobre el uso de redes sociales. Tu escuela tiene ${fmt(N)} estudiantes en 4 grados: ${conteos.map((c, i) => `${ORDINALES[i]} (${c})`).join(', ')}. Usas muestreo estratificado proporcional con una muestra de n = ${n} estudiantes. ¿A cuántos estudiantes del ${ORDINALES[g]} grado debes encuestar?`,
      respuesta: v,
      unidades: 'estudiantes',
      tolerancia: 0,
      pasos: [
        `Fracción de muestreo: f = n/N = ${n}/${fmt(N)} = ${fmt(f)} = ${fmt(f * 100)} %.`,
        `Por grado: ${conteos.map((c, i) => `${ORDINALES[i]}: ${c} × ${fmt(f)} = ${muestra[i]}`).join('; ')}.`,
        `Verificación: ${muestra.join(' + ')} = ${n}. Del ${ORDINALES[g]} grado debes encuestar a ${v} estudiantes.`,
      ],
      respuestaTexto: `${v} estudiantes`,
    };
  },
});

// ── PM-VI-P09-A2 · Distribución normal y puntuación z ───────────────────────
// Arreglo (no objeto): en un objeto JS las claves «1» y «2» se reordenarían al principio.
const PHI: [number, number][] = [[-2, 0.0228], [-1.5, 0.0668], [-1, 0.1587], [-0.5, 0.3085], [0.5, 0.6915], [1, 0.8413], [1.5, 0.9332], [2, 0.9772]];
const TABLA_PHI = PHI.map(([z, v]) => `Φ(${fmt(z)}) ≈ ${fmt(v)}`).join(', ');
const POBLACIONES = [
  { quien: 'los hombres adultos', mu: 170, sigma: 7 },
  { quien: 'las mujeres adultas', mu: 157, sigma: 6 },
] as const;

const normalZ = definir({
  original: { pob: 0, z: 2 },
  elegir: (rng) => ({ pob: entero(rng, 0, 1), z: elegir(rng, [-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2]) }),
  resolver: ({ pob, z }) => {
    const { quien, mu, sigma } = POBLACIONES[pob]!;
    const x = redondear(mu + z * sigma, 1);
    const phi = PHI.find(([zz]) => zz === z)![1];
    const pct = redondear(phi * 100, 2);
    return {
      problema: `La estatura de ${quien} en México se modela con una distribución normal de media μ = ${mu} cm y desviación estándar σ = ${sigma} cm. (b) ¿Qué probabilidad hay de que una persona mida menos de ${fmt(x)} cm? Estandariza con z = (x − μ)/σ y usa la tabla: ${TABLA_PHI}. Responde en porcentaje.`,
      respuesta: pct,
      unidades: '%',
      tolerancia: 0.5,
      pasos: [
        `Estandariza: z = (${fmt(x)} − ${mu}) / ${sigma} = ${fmt(redondear(x - mu, 1))} / ${sigma} = ${fmt(z)}.`,
        `P(X < ${fmt(x)}) = P(Z < ${fmt(z)}) = Φ(${fmt(z)}) ≈ ${fmt(phi)}.`,
        `En porcentaje: ${fmt(phi)} × 100 = ${fmt(pct)} %.`,
      ],
      respuestaTexto: `${fmt(pct)} %`,
    };
  },
});

// ── PM-VI-P10-A2 · Diagrama de Venn ─────────────────────────────────────────
const DEPORTES: [string, string, string, string][] = [
  ['fútbol', 'F', 'básquetbol', 'B'],
  ['voleibol', 'V', 'natación', 'N'],
  ['atletismo', 'A', 'fútbol', 'F'],
];
const venn = definir({
  original: { soloA: 12, soloB: 8, ambos: 10, ninguno: 10, dep: 0 },
  elegir: (rng) => ({ soloA: entero(rng, 4, 15), soloB: entero(rng, 4, 15), ambos: entero(rng, 3, 12), ninguno: entero(rng, 2, 12), dep: entero(rng, 0, DEPORTES.length - 1) }),
  resolver: ({ soloA, soloB, ambos, ninguno, dep }) => {
    const [a, A, b, B] = DEPORTES[dep]!;
    const nA = soloA + ambos;
    const nB = soloB + ambos;
    const union = nA + nB - ambos;
    const N = union + ninguno;
    return {
      problema: `En un grupo de ${N} estudiantes se preguntó qué deporte practican. ${nA} practican ${a} (${A}), ${nB} practican ${b} (${B}) y ${ambos} practican AMBOS. (c) ¿Cuántos NO practican ninguno de los dos (el complemento de la unión)?`,
      respuesta: ninguno,
      unidades: 'estudiantes',
      tolerancia: 0,
      pasos: [
        `La intersección ${A}∩${B} = ${ambos}. Solo ${a} = ${nA} − ${ambos} = ${soloA}. Solo ${b} = ${nB} − ${ambos} = ${soloB}.`,
        `Unión ${A}∪${B} = ${nA} + ${nB} − ${ambos} = ${union} (principio de inclusión-exclusión).`,
        `Ninguno = universal − unión = ${N} − ${union} = ${ninguno} estudiantes.`,
      ],
      respuestaTexto: `${ninguno} estudiantes`,
    };
  },
});

// ── PM-VI-P11-A2 · Comités (combinaciones) ──────────────────────────────────
const NOMBRES = ['Ana', 'Beto', 'Carla', 'Diego', 'Eva', 'Fernando', 'Gaby', 'Hugo', 'Itzel', 'Jorge'];
const comite = definir({
  original: { n: 5, k: 3 },
  elegir: (rng) => {
    const n = entero(rng, 5, 10);
    return { n, k: entero(rng, 2, Math.min(4, n - 2)) };
  },
  resolver: ({ n, k }) => {
    const c = combinaciones(n, k);
    const lista = NOMBRES.slice(0, n);
    const nombres = `${lista.slice(0, -1).join(', ')} y ${lista[n - 1]}`;
    return {
      problema: `En un grupo de ${n} estudiantes: ${nombres}. (b) COMITÉ: ¿de cuántas formas se puede elegir un comité de ${k} entre los ${n}? (¿Importa el orden?)`,
      respuesta: c,
      unidades: 'comités',
      tolerancia: 0,
      pasos: [
        'No importa el orden (un comité es el mismo sin importar cómo se nombre): es una combinación.',
        `C(${n},${k}) = ${n}! / (${k}! · ${n - k}!) = ${fmt(factorial(n))} / (${factorial(k)} · ${factorial(n - k)}).`,
        `C(${n},${k}) = ${fmt(c)} comités.`,
      ],
      respuestaTexto: `${fmt(c)} comités`,
    };
  },
});

// ── PM-VI-P12-A2 · Tabla de contingencia ────────────────────────────────────
const contingencia = definir({
  original: { H: 50, fH: 30, M: 50, fM: 30, grupo: 'hombres' as 'hombres' | 'mujeres' },
  elegir: (rng) => {
    const H = elegir(rng, [20, 25, 40, 50]);
    const M = elegir(rng, [20, 25, 40, 50]);
    return {
      H, M,
      fH: entero(rng, Math.ceil(H * 0.2), Math.floor(H * 0.8)),
      fM: entero(rng, Math.ceil(M * 0.2), Math.floor(M * 0.8)),
      grupo: elegir(rng, ['hombres', 'mujeres'] as const),
    };
  },
  resolver: ({ H, fH, M, fM, grupo }) => {
    const pH = redondear((fH / H) * 100, 2);
    const pM = redondear((fM / M) * 100, 2);
    const [f, T, p, otroP, otro] = grupo === 'hombres' ? [fH, H, pH, pM, 'mujeres'] : [fM, M, pM, pH, 'hombres'];
    const relacion = p === otroP
      ? 'las proporciones son iguales, así que el sexo y el deporte favorito parecen independientes'
      : 'las proporciones difieren, así que hay indicios de asociación entre el sexo y el deporte favorito';
    return {
      problema: `Se encuestó a ${H + M} estudiantes sobre su sexo y su deporte favorito. Hombres: ${fH} fútbol, ${H - fH} básquetbol (${H} en total). Mujeres: ${fM} fútbol, ${M - fM} básquetbol (${M} en total). (a) ¿Qué porcentaje de ${grupo === 'hombres' ? 'los hombres' : 'las mujeres'} prefiere fútbol?`,
      respuesta: p,
      unidades: '%',
      tolerancia: 0.5,
      pasos: [
        `Toma solo la fila de ${grupo}: ${f} prefieren fútbol de ${T} en total.`,
        `Proporción: ${f}/${T} = ${fmt(f / T)}.`,
        `En porcentaje: ${fmt(p)} % de ${grupo === 'hombres' ? 'los hombres' : 'las mujeres'} prefiere fútbol (contra ${fmt(otroP)} % de ${otro === 'hombres' ? 'los hombres' : 'las mujeres'}: ${relacion}).`,
      ],
      respuestaTexto: `${fmt(p)} %`,
    };
  },
});

export const DEFINICIONES_PM_4A6: Record<string, Definicion> = {
  'PM-IV-P01-A2': cafe,
  'PM-IV-P02-A2': pelota,
  'PM-IV-P03-A2': arbolTangente,
  'PM-IV-P05-A2': leyCosenos,
  'PM-IV-P06-A2': distanciaPuntos,
  'PM-IV-P08-A2': antena,
  'PM-V-P01-A2': limiteIndeterminado,
  'PM-V-P02-A2': discontinuidad,
  'PM-V-P03-A2': tangenteDefinicion,
  'PM-V-P04-A2': reglaProducto,
  'PM-V-P05-A2': derivadaLn,
  'PM-V-P06-A2': extremosCubica,
  'PM-V-P07-A2': optimizacion,
  'PM-V-P08-A2': linealizacion,
  'PM-V-P09-A2': extremoImpar,
  'PM-V-P10-A2': integralDistancia,
  'PM-VI-P02-A2': frecuenciaAcumulada,
  'PM-VI-P03-A2': medianaSalarios,
  'PM-VI-P04-A2': desviacionEstandar,
  'PM-VI-P06-A2': bayes,
  'PM-VI-P07-A2': estratificado,
  'PM-VI-P09-A2': normalZ,
  'PM-VI-P10-A2': venn,
  'PM-VI-P11-A2': comite,
  'PM-VI-P12-A2': contingencia,
};
