/**
 * Registro de métricas de latencia con memoria acotada.
 *
 * A alta concurrencia y varios minutos se acumulan millones de muestras; guardar
 * cada una reventaría la RAM. Usamos reservoir sampling (algoritmo R de Vitter):
 * mantenemos una muestra representativa de tamaño fijo por escenario para estimar
 * percentiles, además de contadores exactos (n, errores, suma, min, max).
 */

const CAP_RESERVOIR = 20_000;

class Serie {
  private muestras: number[] = [];
  private vistas = 0;
  n = 0;
  errores = 0;
  suma = 0;
  min = Infinity;
  max = 0;

  registrar(ms: number, ok: boolean): void {
    this.n++;
    this.suma += ms;
    if (ms < this.min) this.min = ms;
    if (ms > this.max) this.max = ms;
    if (!ok) this.errores++;

    // Reservoir sampling sobre TODAS las latencias (ok y error incluidas).
    this.vistas++;
    if (this.muestras.length < CAP_RESERVOIR) {
      this.muestras.push(ms);
    } else {
      const j = Math.floor(Math.random() * this.vistas);
      if (j < CAP_RESERVOIR) this.muestras[j] = ms;
    }
  }

  percentil(p: number): number {
    if (this.muestras.length === 0) return 0;
    const ordenado = [...this.muestras].sort((a, b) => a - b);
    const idx = Math.min(
      ordenado.length - 1,
      Math.max(0, Math.ceil((p / 100) * ordenado.length) - 1)
    );
    return ordenado[idx] ?? 0;
  }

  get media(): number {
    return this.n > 0 ? this.suma / this.n : 0;
  }

  get errorPct(): number {
    return this.n > 0 ? (this.errores / this.n) * 100 : 0;
  }
}

export class Recorder {
  private series = new Map<string, Serie>();

  registrar(escenario: string, ms: number, ok: boolean): void {
    let s = this.series.get(escenario);
    if (!s) {
      s = new Serie();
      this.series.set(escenario, s);
    }
    s.registrar(ms, ok);
  }

  /** Serie agregada "TOTAL" combinando todos los escenarios de este recorder. */
  private total(): Serie {
    const t = new Serie();
    for (const s of this.series.values()) {
      t.n += s.n;
      t.errores += s.errores;
      t.suma += s.suma;
      t.min = Math.min(t.min, s.min);
      t.max = Math.max(t.max, s.max);
    }
    // Percentiles del total: mezclamos reservoirs re-registrando una muestra.
    // (aprox suficiente para lectura de techos)
    return t;
  }

  totales(): { n: number; errores: number; errorPct: number } {
    const t = this.total();
    return { n: t.n, errores: t.errores, errorPct: t.n > 0 ? (t.errores / t.n) * 100 : 0 };
  }

  /** p95 del escenario más lento (proxy conservador del p95 de la etapa). */
  p95Peor(): number {
    let peor = 0;
    for (const s of this.series.values()) peor = Math.max(peor, s.percentil(95));
    return peor;
  }

  filasEscenario(): Array<{
    escenario: string;
    n: number;
    errorPct: number;
    media: number;
    p50: number;
    p95: number;
    p99: number;
    max: number;
  }> {
    return [...this.series.entries()].map(([escenario, s]) => ({
      escenario,
      n: s.n,
      errorPct: s.errorPct,
      media: s.media,
      p50: s.percentil(50),
      p95: s.percentil(95),
      p99: s.percentil(99),
      max: s.max,
    }));
  }
}

// ── Formato de tabla en consola ──────────────────────────────────────────────

function pad(s: string | number, ancho: number, derecha = true): string {
  const str = String(s);
  if (str.length >= ancho) return str;
  const relleno = " ".repeat(ancho - str.length);
  return derecha ? relleno + str : str + relleno;
}

export function ms(n: number): string {
  return `${Math.round(n)}ms`;
}

/** Tabla por escenario de una etapa. */
export function tablaEscenarios(rec: Recorder): string {
  const filas = rec.filasEscenario();
  const cab =
    pad("escenario", 16, false) +
    pad("n", 9) +
    pad("err%", 8) +
    pad("media", 9) +
    pad("p50", 8) +
    pad("p95", 9) +
    pad("p99", 9) +
    pad("max", 9);
  const sep = "─".repeat(cab.length);
  const cuerpo = filas
    .map(
      (f) =>
        pad(f.escenario, 16, false) +
        pad(f.n, 9) +
        pad(f.errorPct.toFixed(1), 8) +
        pad(ms(f.media), 9) +
        pad(ms(f.p50), 8) +
        pad(ms(f.p95), 9) +
        pad(ms(f.p99), 9) +
        pad(ms(f.max), 9)
    )
    .join("\n");
  return `${cab}\n${sep}\n${cuerpo}`;
}
