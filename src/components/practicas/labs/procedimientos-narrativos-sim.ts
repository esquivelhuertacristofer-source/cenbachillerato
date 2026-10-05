/**
 * Simulador «Taller del relato» — la lógica pura, sin React.
 *
 * Un cuento ORIGINAL y ficticio («El pan de la madrugada») en siete escenas.
 * El alumno decide el narrador y el orden en que se cuenta; el simulador
 * calcula una curva de suspenso, cuánta sorpresa llega al giro, qué tan cerca
 * queda el lector y qué saltos de tiempo se produjeron. Todas las cifras son
 * una SIMULACIÓN didáctica, no una medida literaria.
 */

import type { Marca, Voz } from "./procedimientos-narrativos-data";

export const RUTA_FOTOS_NARRATIVA = "/media/labs-sim/procedimientos-narrativos";

export type TipoEscena = "calma" | "pista" | "tension" | "giro";

export interface EscenaCuento {
  id: string;
  /** Lugar en la HISTORIA (1 = lo primero que pasó). */
  cronologia: number;
  tipo: TipoEscena;
  foto: string;
  icono: string;
  /** Título corto de la viñeta. */
  titulo: string;
  texto: string;
  /** Solo puede contarla quien conoce la mente de Mara. */
  interior?: boolean;
  /** Solo la conoce un narrador omnisciente. */
  privada?: boolean;
  /** Si se cuenta antes del giro, el lector adivina al culpable. */
  adelantaElFinal?: boolean;
}

export const CUENTO_TITULO = "El pan de la madrugada";

export const CUENTO: EscenaCuento[] = [
  {
    id: "e1",
    cronologia: 1,
    tipo: "calma",
    foto: "escena-antecedente",
    icono: "fa-store",
    titulo: "La despedida",
    texto: "Hace tres años, don Celso cerró su panadería de San Isidro y dijo que se iría a vivir con su hija.",
    adelantaElFinal: true,
  },
  {
    id: "e2",
    cronologia: 2,
    tipo: "pista",
    foto: "escena-pan-tibio",
    icono: "fa-bread-slice",
    titulo: "El pan tibio",
    texto: "Un lunes de octubre, Mara halló un pan de anís todavía tibio sobre el escalón del local vacío.",
  },
  {
    id: "e3",
    cronologia: 3,
    tipo: "pista",
    foto: "escena-huella-harina",
    icono: "fa-shoe-prints",
    titulo: "La huella",
    texto: "El martes, otro pan, una huella de harina en la puerta y una luz que se apagó en el sótano.",
  },
  {
    id: "e4",
    cronologia: 4,
    tipo: "tension",
    foto: "escena-mara-escondida",
    icono: "fa-heart-pulse",
    titulo: "Miedo y curiosidad",
    texto: "Escondida tras un poste, Mara sintió miedo y, a la vez, unas ganas enormes de saber quién era.",
    interior: true,
  },
  {
    id: "e5",
    cronologia: 5,
    tipo: "pista",
    foto: "escena-sotano-amasando",
    icono: "fa-hands-bubbles",
    titulo: "Amasar a solas",
    texto: "Abajo, don Celso amasaba solo: en casa de su hija el silencio de las madrugadas se le hacía insoportable.",
    privada: true,
  },
  {
    id: "e6",
    cronologia: 6,
    tipo: "giro",
    foto: "escena-descubrimiento",
    icono: "fa-door-open",
    titulo: "La puerta del sótano",
    texto: "A las cinco, Mara abrió la puerta del sótano y encontró a don Celso con las manos en la masa.",
  },
  {
    id: "e7",
    cronologia: 7,
    tipo: "calma",
    foto: "escena-hornean-juntos",
    icono: "fa-people-group",
    titulo: "Hornear juntos",
    texto: "Desde entonces, los dos hornean cada madrugada y reparten el pan antes de que abra la escuela.",
  },
];

export interface NarradorInfo {
  id: Voz;
  titulo: string;
  corto: string;
  icono: string;
  color: string;
  /** Cuánto empuja cada pista el suspenso del lector. */
  multiplicador: number;
  /** Cercanía emocional con la protagonista, de 0 a 10. */
  cercania: number;
  quedaFuera: string;
}

export const NARRADORES: NarradorInfo[] = [
  { id: "primera", titulo: "Mara cuenta («yo»)", corto: "Primera persona", icono: "fa-user", color: "#5BC8FF", multiplicador: 1.3, cercania: 9, quedaFuera: "no puede contar lo que pasa dentro de don Celso" },
  { id: "testigo", titulo: "Una vecina que mira", corto: "Testigo", icono: "fa-eye", color: "#FFC75A", multiplicador: 1, cercania: 6, quedaFuera: "no entra a la cabeza de nadie: solo cuenta lo que se ve" },
  { id: "omnisciente", titulo: "Narrador omnisciente", corto: "Omnisciente", icono: "fa-sun", color: "#C08BFF", multiplicador: 0.8, cercania: 4, quedaFuera: "lo sabe todo, y por eso al lector le queda menos misterio" },
];

export function narradorDe(v: Voz): NarradorInfo {
  return NARRADORES.find((n) => n.id === v) ?? NARRADORES[0]!;
}

/** ¿Este narrador puede contar esta escena? */
export function puedeContar(e: EscenaCuento, v: Voz): boolean {
  if (e.privada) return v === "omnisciente";
  if (e.interior) return v !== "testigo";
  return true;
}

export const ORDEN_CRONOLOGICO: string[] = CUENTO.map((e) => e.id);

const GANANCIA: Record<TipoEscena, number> = { pista: 3, tension: 1.5, calma: -0.5, giro: 0 };

export interface PuntoCurva {
  id: string;
  /** Nivel de suspenso justo después de contar la escena (0–10). */
  nivel: number;
  contada: boolean;
}

export interface Salto {
  id: string;
  marca: Marca;
}

export interface Resultado {
  curva: PuntoCurva[];
  /** Suspenso acumulado cuando llega el giro (0–10). */
  sorpresa: number;
  /** Cercanía emocional con Mara (0–10). */
  cercania: number;
  /** Porcentaje de escenas que el lector llega a conocer. */
  informacion: number;
  saltos: Salto[];
  /** El giro llegó antes que las pistas. */
  finalAdelantado: boolean;
  /** Se contó el antecedente antes del giro y el lector adivinó. */
  adivinado: boolean;
  /** Pistas que el lector alcanzó a recibir antes del giro. */
  pistasAntes: number;
  /** Escenas que el narrador no puede contar. */
  omitidas: string[];
}

const tope = (n: number) => Math.max(0, Math.min(10, n));
const un = (n: number) => Math.round(n * 10) / 10;

export function evaluar(orden: string[], narrador: Voz): Resultado {
  const info = narradorDe(narrador);
  const escenas = orden.map((id) => CUENTO.find((e) => e.id === id)).filter((e): e is EscenaCuento => !!e);
  const curva: PuntoCurva[] = [];
  const saltos: Salto[] = [];
  const omitidas: string[] = [];

  let nivel = 0;
  let sorpresa = 0;
  let giroVisto = false;
  let adivinado = false;
  let pistasAntes = 0;
  let maxCrono = 0;
  const contadas = new Set<string>();

  for (const e of escenas) {
    if (!puedeContar(e, narrador)) {
      omitidas.push(e.id);
      curva.push({ id: e.id, nivel: un(nivel), contada: false });
      continue;
    }
    // Marca de tiempo: contra lo que ya se contó y lo que sigue pendiente.
    const pendientes = escenas.filter((x) => puedeContar(x, narrador) && !contadas.has(x.id));
    const esperada = Math.min(...pendientes.map((x) => x.cronologia));
    let marca: Marca = "sigue";
    if (e.cronologia < maxCrono) marca = "analepsis";
    else if (e.cronologia > esperada) marca = "prolepsis";
    saltos.push({ id: e.id, marca });
    maxCrono = Math.max(maxCrono, e.cronologia);
    contadas.add(e.id);

    if (e.tipo === "giro") {
      sorpresa = nivel;
      giroVisto = true;
      nivel = nivel * 0.3;
    } else {
      if (e.adelantaElFinal && !giroVisto) adivinado = true;
      if (e.tipo === "pista" && !giroVisto) pistasAntes += 1;
      const g = GANANCIA[e.tipo];
      nivel = tope(nivel + (g > 0 ? g * info.multiplicador : g));
    }
    curva.push({ id: e.id, nivel: un(nivel), contada: true });
  }

  if (adivinado) sorpresa = Math.max(0, sorpresa - 2.5);
  const finalAdelantado = escenas.findIndex((e) => e.tipo === "giro") < escenas.findIndex((e) => e.tipo === "pista" && puedeContar(e, narrador));

  return {
    curva,
    sorpresa: un(tope(sorpresa)),
    cercania: info.cercania,
    informacion: Math.round((contadas.size / CUENTO.length) * 100),
    saltos,
    finalAdelantado,
    adivinado,
    pistasAntes,
    omitidas,
  };
}

export interface Reaccion {
  icono: string;
  color: string;
  frase: string;
  porque: string;
}

/** Cómo reacciona Ximena, una lectora ficticia, al terminar el cuento. */
export function reaccionLectora(r: Resultado): Reaccion {
  if (r.finalAdelantado) {
    return { icono: "fa-face-meh", color: "#FF8A3C", frase: "«Ya sé quién es… y todavía no empieza.»", porque: "El giro llegó antes que las pistas: no hubo nada que acumular." };
  }
  if (r.sorpresa >= 7) {
    return { icono: "fa-face-surprise", color: "#34D399", frase: "«¡No lo vi venir!»", porque: `Llegaron ${r.pistasAntes} pistas antes del giro y el lector no pudo adivinar.` };
  }
  if (r.adivinado) {
    return { icono: "fa-face-smile-wink", color: "#FFC75A", frase: "«Me lo imaginaba desde el principio.»", porque: "Contar la despedida de don Celso antes del giro delató al panadero." };
  }
  if (r.sorpresa >= 4) {
    return { icono: "fa-face-smile", color: "#5BC8FF", frase: "«Estuvo bien, pero esperaba más.»", porque: "Hubo suspenso, aunque pocas pistas llegaron antes del giro." };
  }
  return { icono: "fa-face-meh", color: "#FF8A3C", frase: "«Se me acabó el misterio muy pronto.»", porque: "Casi no se acumuló suspenso antes de revelar el secreto." };
}

/** Pasa la escena `id` una casilla hacia arriba (-1) o hacia abajo (+1). */
export function mover(orden: string[], id: string, delta: -1 | 1): string[] {
  const i = orden.indexOf(id);
  const j = i + delta;
  if (i < 0 || j < 0 || j >= orden.length) return orden;
  const nuevo = [...orden];
  [nuevo[i], nuevo[j]] = [nuevo[j]!, nuevo[i]!];
  return nuevo;
}
