/**
 * Refuerzo de actividades para CNEYT-V (La energía en procesos de vida diaria —
 * física: Newton, cinemática, gravitación, ondas, espectro EM, óptica,
 * electromagnetismo y ética tecnológica) según la "Plantilla CEN por UAC".
 * Agrega A4-A7 a cada una de las 8 progresiones (ya tienen A1-A3):
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * 8 progresiones × 4 = 32 actividades nuevas. estado='borrador'.
 * Alineado al programa oficial CNEYT-V (MCCEMS 2025).
 * Uso: npx tsx scripts/seed-activities-cneytv-refuerzo.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad, type ActividadInput } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

type Refuerzo = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido">;

const letras = ["A4", "A5", "A6", "A7"];

// Escala estándar de autoevaluación (1-4) reutilizada en todas las progresiones.
const escala4 = [
  { valor: 1, etiqueta: "En inicio", descripcion: "Todavía necesito apoyo y consultar el material." },
  { valor: 2, etiqueta: "En proceso", descripcion: "Lo logro con algunos errores o dudas." },
  { valor: 3, etiqueta: "Logrado", descripcion: "Lo hago bien de forma autónoma." },
  { valor: 4, etiqueta: "Destacado", descripcion: "Lo hago con seguridad y puedo ayudar a otra persona." },
];

async function main() {
  const sb = createSB();
  log("\n🌱 Refuerzo CNEYT-V — La energía en procesos de vida diaria: A4-A7 por progresión\n");

  const progs = await getProgresionesDeUAC(sb, "CNEYT-V");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const set = refuerzos[p.numero - 1];
    if (!set) { log(`⚠️  Sin refuerzos definidos para P${p.numero}`); continue; }
    for (let i = 0; i < set.length; i++) {
      const r = set[i];
      const res = await upsertActividad(sb, {
        codigo: `${p.codigo}-${letras[i]}`,
        titulo: r.titulo,
        descripcion: r.descripcion,
        tipo: r.tipo,
        progresion_id: p.id,
        xp: r.xp,
        contenido: r.contenido,
      });
      res ? ok++ : fail++;
    }
  }

  log(`\n✅ CNEYT-V refuerzo: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── REFUERZOS POR PROGRESIÓN ───────────────────────────────────────────────────

const refuerzos: Refuerzo[][] = [
  // ════════════ P01 — Leyes de Newton: movimiento y fuerzas cotidianas ════════════
  [
    {
      titulo: "Verdadero o Falso — Leyes de Newton",
      descripcion: "Decide si cada afirmación sobre las tres leyes de Newton y su aplicación en situaciones cotidianas es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La primera ley de Newton (inercia) establece que un objeto en reposo permanece en reposo y un objeto en movimiento continúa con movimiento rectilíneo uniforme, siempre que la fuerza neta sobre él sea cero.",
            respuesta: true,
            retroalimentacion: "Correcto. La ley de inercia afirma que un cuerpo mantiene su estado de reposo o movimiento rectilíneo uniforme si la fuerza resultante que actúa sobre él es cero.",
          },
          {
            enunciado: "La segunda ley de Newton establece que la aceleración de un cuerpo es inversamente proporcional a la fuerza neta aplicada y directamente proporcional a su masa (a = m/F).",
            respuesta: false,
            retroalimentacion: "Falso. La segunda ley establece F = ma, es decir, la aceleración es directamente proporcional a la fuerza neta e inversamente proporcional a la masa: a = F/m.",
          },
          {
            enunciado: "Según la tercera ley de Newton, cuando un libro reposa sobre una mesa, la mesa ejerce sobre el libro una fuerza normal igual en magnitud pero opuesta en dirección al peso del libro.",
            respuesta: true,
            retroalimentacion: "Correcto. La tercera ley (acción y reacción) indica que las fuerzas de interacción entre dos cuerpos son iguales en magnitud y opuestas en dirección. La fuerza normal de la mesa es la reacción al peso del libro.",
          },
          {
            enunciado: "Si empujas un carrito de supermercado con el doble de fuerza manteniendo la masa constante, la aceleración se reduce a la mitad.",
            respuesta: false,
            retroalimentacion: "Falso. Por la segunda ley, F = ma, si la fuerza se duplica y la masa no cambia, la aceleración se duplica, no se reduce.",
          },
          {
            enunciado: "La fuerza de fricción es siempre opuesta a la dirección del movimiento o del intento de movimiento de un objeto.",
            respuesta: true,
            retroalimentacion: "Correcto. La fricción cinética actúa en dirección opuesta al movimiento, y la fricción estática se opone al intento de movimiento.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Leyes de Newton y fuerzas",
      descripcion: "Glosario interactivo de los conceptos fundamentales de las tres leyes de Newton, masa, peso, fuerza neta e inercia.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Inercia",
            definicion: "Tendencia de un cuerpo a resistir cambios en su estado de movimiento. Un objeto en reposo tiende a permanecer en reposo y uno en movimiento tiende a seguir moviéndose con la misma velocidad y dirección.",
            ejemplo: "Cuando un automóvil frena bruscamente, los pasajeros se inclinan hacia adelante por inercia: sus cuerpos tienden a continuar con el movimiento original.",
            etiquetas: ["inercia", "primera ley", "Newton"],
          },
          {
            termino: "Fuerza neta (resultante)",
            definicion: "Suma vectorial de todas las fuerzas que actúan sobre un cuerpo. Si la fuerza neta es cero, el cuerpo se encuentra en equilibrio (reposo o movimiento rectilíneo uniforme).",
            ejemplo: "Un libro sobre una mesa: peso (9.8 N hacia abajo) + normal (9.8 N hacia arriba) = fuerza neta 0 N → equilibrio.",
            etiquetas: ["fuerza neta", "resultante", "equilibrio"],
          },
          {
            termino: "Segunda ley de Newton (F = ma)",
            definicion: "La fuerza neta sobre un cuerpo es igual al producto de su masa por su aceleración: F = ma. La aceleración es directamente proporcional a F e inversamente proporcional a m.",
            ejemplo: "Para acelerar una caja de 10 kg a 2 m/s², se necesita F = 10 × 2 = 20 N.",
            etiquetas: ["segunda ley", "F=ma", "aceleración"],
          },
          {
            termino: "Tercera ley de Newton (acción y reacción)",
            definicion: "Por cada fuerza de acción que un cuerpo A ejerce sobre un cuerpo B, existe una fuerza de reacción de B sobre A, igual en magnitud, misma línea de acción y sentido contrario.",
            ejemplo: "Al caminar, el pie empuja el suelo hacia atrás (acción); el suelo empuja el pie hacia adelante (reacción), propulsando el movimiento.",
            etiquetas: ["tercera ley", "acción-reacción"],
          },
          {
            termino: "Peso y masa",
            definicion: "La masa (kg) es la cantidad de materia de un cuerpo; el peso (N) es la fuerza gravitacional que actúa sobre ella: W = mg, donde g ≈ 9.8 m/s² en la superficie terrestre.",
            ejemplo: "Un objeto de 5 kg tiene peso W = 5 × 9.8 = 49 N cerca de la superficie de la Tierra.",
            etiquetas: ["peso", "masa", "gravedad"],
          },
          {
            termino: "Fricción (rozamiento)",
            definicion: "Fuerza de contacto que se opone al movimiento o al intento de movimiento entre dos superficies. Puede ser estática (objeto en reposo) o cinética (objeto en movimiento).",
            ejemplo: "El coeficiente de fricción cinética entre goma y asfalto seco (≈ 0.7) explica por qué los autos pueden frenar eficazmente en carretera seca.",
            etiquetas: ["fricción", "rozamiento", "fuerza de contacto"],
          },
        ],
        actividad_final: "Describe dos situaciones cotidianas diferentes en las que puedas identificar claramente cada una de las tres leyes de Newton. Para cada situación, indica cuál es la fuerza, la acción y la reacción, y si existe equilibrio o aceleración.",
      },
    },
    {
      titulo: "Completa los espacios — Leyes de Newton",
      descripcion: "Completa los enunciados clave sobre las tres leyes de Newton y la relación entre fuerza, masa y aceleración.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o valor correcto.",
        texto_con_huecos: "La primera ley de Newton se conoce como la ley de ___. Según F = ma, para acelerar una masa de 4 kg a 3 m/s² se necesita una fuerza de ___ N. La tercera ley de Newton establece que a toda acción corresponde una ___ igual y opuesta. El peso de un objeto de 10 kg en la superficie terrestre (g ≈ 9.8 m/s²) es ___ N.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "inercia",
            alternativas_aceptadas: ["la inercia"],
            pista: "La primera ley describe la tendencia de los cuerpos a mantener su estado de movimiento: ley de ___.",
          },
          {
            posicion: 1,
            respuesta_correcta: "12",
            alternativas_aceptadas: ["12 N"],
            pista: "F = m × a = 4 kg × 3 m/s² = ? N",
          },
          {
            posicion: 2,
            respuesta_correcta: "reacción",
            alternativas_aceptadas: ["reaccion"],
            pista: "La tercera ley de Newton: acción y ___.",
          },
          {
            posicion: 3,
            respuesta_correcta: "98",
            alternativas_aceptadas: ["98 N"],
            pista: "W = m × g = 10 kg × 9.8 m/s² = ? N",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Leyes de Newton",
      descripcion: "Reflexiona sobre tu comprensión de las tres leyes de Newton y su aplicación a situaciones cotidianas.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Esto te ayudará a identificar qué reforzar.",
        criterios: [
          { descripcion: "Enuncio las tres leyes de Newton y las distingo entre sí con ejemplos cotidianos.", escala: escala4 },
          { descripcion: "Aplico F = ma para calcular fuerza, masa o aceleración dado los otros dos valores.", escala: escala4 },
          { descripcion: "Identifico pares acción-reacción en situaciones reales (caminar, nadar, cohetes).", escala: escala4 },
          { descripcion: "Analizo situaciones de equilibrio (fuerza neta = 0) y de aceleración (fuerza neta ≠ 0).", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Cómo explicarías con tus propias palabras por qué un pasajero en un autobús se inclina hacia adelante cuando el conductor frena? ¿Qué ley de Newton describe mejor este fenómeno y por qué?",
      },
    },
  ],

  // ════════════ P02 — Movimiento rectilíneo uniforme y uniformemente acelerado ════════════
  [
    {
      titulo: "Verdadero o Falso — MRU y MRUA",
      descripcion: "Decide si cada afirmación sobre el movimiento rectilíneo uniforme (MRU) y el uniformemente acelerado (MRUA), sus ecuaciones y gráficas es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "En el movimiento rectilíneo uniforme (MRU), la velocidad es constante y la aceleración es igual a cero.",
            respuesta: true,
            retroalimentacion: "Correcto. En el MRU no hay cambio de velocidad, por lo que la aceleración es cero. La gráfica v-t es una línea horizontal.",
          },
          {
            enunciado: "En el MRUA, la ecuación que relaciona la velocidad final con la inicial es v = v₀ + at. Si v₀ = 0 y a = 4 m/s², a los 3 s la velocidad es 12 m/s.",
            respuesta: true,
            retroalimentacion: "Correcto: v = 0 + 4 × 3 = 12 m/s. La ecuación v = v₀ + at es la cinemática básica del MRUA.",
          },
          {
            enunciado: "En la gráfica posición-tiempo (x-t) de un MRU, la curva es una parábola porque la posición cambia aceleradamente.",
            respuesta: false,
            retroalimentacion: "Falso. En el MRU la gráfica x-t es una línea recta (la posición cambia de forma constante). La parábola en x-t corresponde al MRUA.",
          },
          {
            enunciado: "Un objeto cae libremente desde el reposo. Después de 2 segundos, con g = 9.8 m/s², su velocidad es v = 19.6 m/s.",
            respuesta: true,
            retroalimentacion: "Correcto: v = v₀ + gt = 0 + 9.8 × 2 = 19.6 m/s. La caída libre es un caso de MRUA con a = g ≈ 9.8 m/s².",
          },
          {
            enunciado: "En la gráfica velocidad-tiempo (v-t) de un MRUA, el área bajo la curva representa la aceleración del movimiento.",
            respuesta: false,
            retroalimentacion: "Falso. En la gráfica v-t, el área bajo la curva representa el desplazamiento (distancia recorrida). La pendiente de la recta v-t es la aceleración.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Cinemática: MRU y MRUA",
      descripcion: "Glosario interactivo sobre los conceptos de posición, velocidad, aceleración, MRU y MRUA, y su representación gráfica y algebraica.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Movimiento rectilíneo uniforme (MRU)",
            definicion: "Movimiento en línea recta con velocidad constante y aceleración cero. La posición varía linealmente con el tiempo: x = x₀ + vt.",
            ejemplo: "Un automóvil en autopista a velocidad constante de 90 km/h sin acelerar ni frenar: recorre d = v × t = 90 × 2 = 180 km en 2 horas.",
            etiquetas: ["MRU", "velocidad constante", "cinemática"],
          },
          {
            termino: "Movimiento rectilíneo uniformemente acelerado (MRUA)",
            definicion: "Movimiento en línea recta con aceleración constante. Ecuaciones: v = v₀ + at; x = x₀ + v₀t + ½at²; v² = v₀² + 2a(x − x₀).",
            ejemplo: "Un auto parte del reposo (v₀ = 0) con a = 3 m/s². A los 5 s: v = 3 × 5 = 15 m/s; x = ½ × 3 × 25 = 37.5 m.",
            etiquetas: ["MRUA", "aceleración constante", "cinemática"],
          },
          {
            termino: "Velocidad media",
            definicion: "Razón entre el desplazamiento total y el tiempo transcurrido: v_med = Δx/Δt. No indica cómo varía la velocidad instante a instante.",
            ejemplo: "Un corredor va de A a B (200 m) en 40 s: v_med = 200/40 = 5 m/s. Puede haber variado su rapidez a lo largo del trayecto.",
            etiquetas: ["velocidad media", "desplazamiento"],
          },
          {
            termino: "Gráfica posición-tiempo (x-t)",
            definicion: "En MRU: línea recta con pendiente = velocidad. En MRUA: parábola. La pendiente de la tangente en un punto indica la velocidad instantánea.",
            ejemplo: "Si la gráfica x-t es una recta con pendiente positiva, el objeto se aleja del origen con velocidad constante positiva.",
            etiquetas: ["gráfica x-t", "posición", "representación"],
          },
          {
            termino: "Gráfica velocidad-tiempo (v-t)",
            definicion: "En MRU: línea horizontal (v constante, a = 0). En MRUA: línea recta con pendiente = aceleración. El área bajo la curva v-t = desplazamiento.",
            ejemplo: "Si la gráfica v-t es una recta con pendiente a = 2 m/s², el área entre t = 0 y t = 4 s es: A = ½ base × altura + base × v₀ = desplazamiento.",
            etiquetas: ["gráfica v-t", "aceleración", "área"],
          },
          {
            termino: "Caída libre",
            definicion: "Caso especial de MRUA en dirección vertical con aceleración g ≈ 9.8 m/s² (hacia abajo), sin resistencia del aire. Ecuaciones: v = v₀ + gt; h = v₀t + ½gt².",
            ejemplo: "Objeto en caída libre desde reposo: después de t = 3 s, v = 9.8 × 3 = 29.4 m/s y h = ½ × 9.8 × 9 = 44.1 m.",
            etiquetas: ["caída libre", "gravedad", "MRUA vertical"],
          },
        ],
        actividad_final: "Un automóvil parte del reposo y alcanza 30 m/s con aceleración constante de 5 m/s². (a) ¿Cuánto tarda en alcanzar esa velocidad? (b) ¿Qué distancia recorre? (c) Esboza la gráfica v-t para este movimiento.",
      },
    },
    {
      titulo: "Completa los espacios — Cinemática MRU y MRUA",
      descripcion: "Completa los enunciados clave sobre las ecuaciones cinemáticas del movimiento rectilíneo uniforme y uniformemente acelerado.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término, ecuación o valor correcto.",
        texto_con_huecos: "En el MRU la aceleración es igual a ___. La ecuación cinemática del MRUA que relaciona velocidad con el tiempo es v = v₀ + ___. Un objeto en caída libre desde el reposo (g = 9.8 m/s²) alcanza una velocidad de 49 m/s después de ___ segundos. En la gráfica v-t, el ___ bajo la curva representa el desplazamiento.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "cero",
            alternativas_aceptadas: ["0", "0 m/s²"],
            pista: "En el MRU la velocidad no cambia, por lo tanto la aceleración es ___.",
          },
          {
            posicion: 1,
            respuesta_correcta: "at",
            alternativas_aceptadas: ["a·t", "a × t"],
            pista: "La ecuación completa es v = v₀ + ___ donde a es la aceleración y t el tiempo.",
          },
          {
            posicion: 2,
            respuesta_correcta: "5",
            alternativas_aceptadas: ["5 s"],
            pista: "v = g × t → t = v/g = 49/9.8 = ? s",
          },
          {
            posicion: 3,
            respuesta_correcta: "área",
            alternativas_aceptadas: [],
            pista: "En la gráfica v-t, el ___ bajo la recta (o curva) es igual al desplazamiento.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Cinemática: MRU y MRUA",
      descripcion: "Reflexiona sobre tu comprensión del movimiento rectilíneo uniforme y uniformemente acelerado.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Distingo el MRU del MRUA e identifico sus características en gráficas x-t y v-t.", escala: escala4 },
          { descripcion: "Aplico las ecuaciones cinemáticas (v = v₀ + at; x = x₀ + v₀t + ½at²) para resolver problemas.", escala: escala4 },
          { descripcion: "Calculo e interpreto la velocidad media y la aceleración a partir de datos numéricos o gráficas.", escala: escala4 },
          { descripcion: "Resuelvo problemas de caída libre usando g ≈ 9.8 m/s² y las ecuaciones del MRUA vertical.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Cómo describirías gráficamente la diferencia entre un MRU y un MRUA en una gráfica v-t? ¿Qué información adicional te da la gráfica x-t?",
      },
    },
  ],

  // ════════════ P03 — Gravitación universal: sistema solar y exploración espacial ════════════
  [
    {
      titulo: "Verdadero o Falso — Gravitación universal",
      descripcion: "Decide si cada afirmación sobre la ley de gravitación universal de Newton, las leyes de Kepler y sus implicaciones en el sistema solar es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La ley de gravitación universal establece que la fuerza gravitacional entre dos masas es directamente proporcional al producto de sus masas e inversamente proporcional al cuadrado de la distancia entre ellas: F = G·m₁·m₂/r².",
            respuesta: true,
            retroalimentacion: "Correcto. Esta es la ley de gravitación universal de Newton, donde G ≈ 6.674 × 10⁻¹¹ N·m²/kg² es la constante de gravitación universal.",
          },
          {
            enunciado: "Si la distancia entre dos objetos se duplica, la fuerza gravitacional entre ellos también se duplica.",
            respuesta: false,
            retroalimentacion: "Falso. La fuerza es inversamente proporcional al cuadrado de la distancia. Si r se duplica, F se reduce a F/4 (un cuarto de su valor original).",
          },
          {
            enunciado: "La primera ley de Kepler establece que las órbitas de los planetas alrededor del Sol son elipses con el Sol ubicado en uno de los focos.",
            respuesta: true,
            retroalimentacion: "Correcto. La primera ley de Kepler define la forma elíptica de las órbitas planetarias con el Sol en un foco.",
          },
          {
            enunciado: "La aceleración de la gravedad en la superficie de la Luna es aproximadamente igual a la de la Tierra (9.8 m/s²) porque ambos cuerpos están en el mismo sistema gravitacional.",
            respuesta: false,
            retroalimentacion: "Falso. La gravedad superficial de la Luna es aproximadamente 1.62 m/s², unas 6 veces menor que la de la Tierra, debido a la menor masa y radio lunares.",
          },
          {
            enunciado: "La gravedad es la fuerza que mantiene a los satélites artificiales en órbita alrededor de la Tierra.",
            respuesta: true,
            retroalimentacion: "Correcto. La atracción gravitacional terrestre proporciona la fuerza centrípeta que mantiene a los satélites en órbita circular o elíptica.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Gravitación universal y sistema solar",
      descripcion: "Glosario interactivo sobre gravitación universal, leyes de Kepler, sistema solar y exploración espacial.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Ley de gravitación universal (Newton)",
            definicion: "F = G·m₁·m₂/r², donde F es la fuerza gravitacional, G ≈ 6.674 × 10⁻¹¹ N·m²/kg², m₁ y m₂ son las masas y r es la distancia entre sus centros. La fuerza es siempre atractiva.",
            ejemplo: "La Tierra (5.97 × 10²⁴ kg) atrae a la Luna (7.34 × 10²² kg) a 3.84 × 10⁸ m: F ≈ 1.98 × 10²⁰ N.",
            etiquetas: ["gravitación", "Newton", "fuerza"],
          },
          {
            termino: "Primera ley de Kepler (órbitas elípticas)",
            definicion: "Cada planeta se mueve en una órbita elíptica alrededor del Sol, con el Sol situado en uno de los dos focos de la elipse.",
            ejemplo: "La órbita de la Tierra es casi circular (excentricidad ≈ 0.017), pero técnicamente es una elipse con el Sol en un foco.",
            etiquetas: ["Kepler", "órbita elíptica", "planeta"],
          },
          {
            termino: "Segunda ley de Kepler (áreas iguales)",
            definicion: "La línea que une un planeta con el Sol barre áreas iguales en tiempos iguales. Implica que los planetas se mueven más rápido cerca del Sol (perihelio) y más lento lejos (afelio).",
            ejemplo: "La Tierra se mueve a ~30.3 km/s en perihelio (enero) y a ~29.3 km/s en afelio (julio).",
            etiquetas: ["Kepler", "segunda ley", "velocidad orbital"],
          },
          {
            termino: "Tercera ley de Kepler (períodos y distancias)",
            definicion: "El cuadrado del período orbital T es proporcional al cubo del semieje mayor a de la órbita: T² ∝ a³. Para el sistema solar: T²/a³ = constante.",
            ejemplo: "La Tierra tiene T = 1 año y a = 1 UA. Marte tiene a ≈ 1.52 UA, así T²= 1.52³ ≈ 3.51 → T ≈ 1.87 años.",
            etiquetas: ["Kepler", "período orbital", "tercera ley"],
          },
          {
            termino: "Velocidad de escape",
            definicion: "Velocidad mínima que debe tener un objeto para escapar del campo gravitacional de un cuerpo: v_esc = √(2GM/R). Para la Tierra, v_esc ≈ 11.2 km/s.",
            ejemplo: "Los cohetes deben superar 11.2 km/s para salir de la gravedad terrestre sin propulsión adicional.",
            etiquetas: ["velocidad de escape", "cohete", "exploración espacial"],
          },
          {
            termino: "Gravedad en la superficie (g)",
            definicion: "g = GM/R², donde M es la masa del planeta y R su radio. En la Tierra g ≈ 9.8 m/s²; en la Luna g ≈ 1.62 m/s²; en Marte g ≈ 3.72 m/s².",
            ejemplo: "Un astronauta de 70 kg pesa 686 N en la Tierra, 113 N en la Luna y 260 N en Marte.",
            etiquetas: ["gravedad superficial", "peso", "planeta"],
          },
        ],
        actividad_final: "Un planeta hipotético tarda 8 años en completar su órbita alrededor del Sol. Usando la tercera ley de Kepler (T² = a³, con T en años y a en UA), calcula la distancia media de ese planeta al Sol en unidades astronómicas.",
      },
    },
    {
      titulo: "Completa los espacios — Gravitación universal",
      descripcion: "Completa los enunciados clave sobre la ley de gravitación universal y las leyes de Kepler.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término, valor o expresión correcta.",
        texto_con_huecos: "La fuerza de gravitación universal se expresa como F = G·m₁·m₂/___. Si la distancia entre dos masas se triplica, la fuerza gravitacional entre ellas se vuelve ___ veces menor. La primera ley de Kepler establece que las órbitas de los planetas son ___. La velocidad de escape de la Tierra es aproximadamente ___ km/s.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "r²",
            alternativas_aceptadas: ["r^2"],
            pista: "F = G·m₁·m₂ dividido por el cuadrado de la ___.",
          },
          {
            posicion: 1,
            respuesta_correcta: "9",
            alternativas_aceptadas: ["nueve"],
            pista: "F ∝ 1/r². Si r → 3r, la fuerza se divide por 3² = ? veces.",
          },
          {
            posicion: 2,
            respuesta_correcta: "elipses",
            alternativas_aceptadas: ["elípticas", "elipsis"],
            pista: "Primera ley de Kepler: los planetas se mueven en órbitas ___ con el Sol en un foco.",
          },
          {
            posicion: 3,
            respuesta_correcta: "11.2",
            alternativas_aceptadas: ["11", "11.2 km/s"],
            pista: "Para escapar del campo gravitacional terrestre se necesitan aproximadamente ___ km/s.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Gravitación universal",
      descripcion: "Reflexiona sobre tu comprensión de la gravitación universal, las leyes de Kepler y sus implicaciones en la exploración espacial.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Enuncio la ley de gravitación universal F = G·m₁·m₂/r² e identifico cada variable.", escala: escala4 },
          { descripcion: "Explico cómo varía la fuerza gravitacional al cambiar la distancia o la masa de los cuerpos.", escala: escala4 },
          { descripcion: "Enuncio las tres leyes de Kepler y las aplico para describir el movimiento orbital de los planetas.", escala: escala4 },
          { descripcion: "Relaciono la gravitación universal con fenómenos como las mareas, los satélites y la exploración espacial.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Cómo cambiaría tu peso si vivieras en Marte (g ≈ 3.72 m/s²)? ¿Qué implicaciones físicas tendría esto para los astronautas que viven en la Estación Espacial Internacional, donde la gravedad percibida es casi cero?",
      },
    },
  ],

  // ════════════ P04 — Movimiento ondulatorio: amplitud, frecuencia, longitud de onda, velocidad ════════════
  [
    {
      titulo: "Verdadero o Falso — Movimiento ondulatorio",
      descripcion: "Decide si cada afirmación sobre las ondas mecánicas y sus características (amplitud, frecuencia, longitud de onda, velocidad) es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La velocidad de una onda se relaciona con su frecuencia y longitud de onda mediante la ecuación v = f·λ (velocidad = frecuencia × longitud de onda).",
            respuesta: true,
            retroalimentacion: "Correcto. La ecuación universal de onda v = f·λ relaciona las tres características fundamentales: velocidad (m/s), frecuencia (Hz) y longitud de onda (m).",
          },
          {
            enunciado: "La amplitud de una onda determina su velocidad de propagación: a mayor amplitud, mayor velocidad.",
            respuesta: false,
            retroalimentacion: "Falso. La amplitud no afecta la velocidad de propagación de la onda. La velocidad depende del medio en que se propaga (densidad, elasticidad), no de la amplitud.",
          },
          {
            enunciado: "Una onda con frecuencia de 440 Hz y longitud de onda de 0.78 m se propaga a aproximadamente 343 m/s, que es la velocidad del sonido en el aire a temperatura ambiente.",
            respuesta: true,
            retroalimentacion: "Correcto: v = f·λ = 440 × 0.78 ≈ 343 m/s. Esto corresponde a la nota La (A4 en música) propagándose en el aire.",
          },
          {
            enunciado: "En una onda transversal, las partículas del medio oscilan en la misma dirección en que se propaga la onda.",
            respuesta: false,
            retroalimentacion: "Falso. En una onda transversal las partículas oscilan perpendicularmente a la dirección de propagación. Las ondas longitudinales son las que tienen las oscilaciones en la misma dirección de propagación (como el sonido).",
          },
          {
            enunciado: "El período T y la frecuencia f de una onda son recíprocos: T = 1/f.",
            respuesta: true,
            retroalimentacion: "Correcto. Si f = 5 Hz, entonces T = 1/5 = 0.2 s. El período es el tiempo de un ciclo completo y la frecuencia es el número de ciclos por segundo.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Movimiento ondulatorio",
      descripcion: "Glosario interactivo sobre las características de las ondas mecánicas: amplitud, frecuencia, período, longitud de onda y velocidad de propagación.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Amplitud (A)",
            definicion: "Desplazamiento máximo de una partícula del medio respecto a su posición de equilibrio. Se mide en metros (m). Determina la energía transportada por la onda (E ∝ A²).",
            ejemplo: "Una onda sonora de alta amplitud suena más fuerte; una ola oceánica de gran amplitud tiene mayor energía destructiva.",
            etiquetas: ["amplitud", "onda", "energía"],
          },
          {
            termino: "Frecuencia (f)",
            definicion: "Número de ciclos completos de oscilación por segundo. Unidad: hertz (Hz = 1/s). Relacionada con el período: f = 1/T.",
            ejemplo: "La frecuencia audible humana va de 20 Hz a 20 000 Hz. Una onda de 200 Hz completa 200 ciclos cada segundo.",
            etiquetas: ["frecuencia", "Hz", "ciclos"],
          },
          {
            termino: "Período (T)",
            definicion: "Tiempo que tarda una partícula en completar un ciclo completo de oscilación. Unidad: segundo (s). T = 1/f.",
            ejemplo: "Si una onda tiene f = 50 Hz, su período es T = 1/50 = 0.02 s = 20 ms.",
            etiquetas: ["período", "ciclo", "tiempo"],
          },
          {
            termino: "Longitud de onda (λ)",
            definicion: "Distancia entre dos puntos consecutivos en igual fase (por ejemplo, entre dos crestas o dos valles consecutivos). Unidad: metro (m).",
            ejemplo: "El sonido de 340 Hz en el aire (v ≈ 340 m/s) tiene λ = v/f = 340/340 = 1 m.",
            etiquetas: ["longitud de onda", "lambda", "cresta"],
          },
          {
            termino: "Velocidad de propagación (v = f·λ)",
            definicion: "Rapidez a la que la energía de la onda se desplaza por el medio. v = f·λ. Depende de las propiedades del medio, no de la amplitud ni la fuente.",
            ejemplo: "El sonido viaja a ≈ 343 m/s en el aire (20°C), a ≈ 1 480 m/s en el agua y a ≈ 5 100 m/s en el acero.",
            etiquetas: ["velocidad de onda", "v=fλ", "propagación"],
          },
          {
            termino: "Ondas transversales y longitudinales",
            definicion: "Transversales: las oscilaciones son perpendiculares a la dirección de propagación (ej. ondas en una cuerda, ondas de luz). Longitudinales: las oscilaciones son paralelas a la dirección de propagación (ej. sonido, ondas sísmicas P).",
            ejemplo: "Al agitar una cuerda tensa verticalmente, se propaga una onda transversal. Al comprimir y expandir un resorte en su longitud, se forma una onda longitudinal.",
            etiquetas: ["onda transversal", "onda longitudinal", "tipos"],
          },
        ],
        actividad_final: "Una onda sonora tiene una frecuencia de 680 Hz y se propaga en el aire a 340 m/s. (a) Calcula su longitud de onda. (b) Calcula su período. (c) Si la amplitud se duplica, ¿cambia la velocidad? Justifica tu respuesta.",
      },
    },
    {
      titulo: "Completa los espacios — Movimiento ondulatorio",
      descripcion: "Completa los enunciados clave sobre las características de las ondas y la ecuación de propagación.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término, símbolo o valor correcto.",
        texto_con_huecos: "La ecuación universal de onda que relaciona velocidad, frecuencia y longitud de onda es v = ___·λ. Si una onda tiene frecuencia 200 Hz, su período es T = ___ s. La amplitud de una onda determina la ___ que transporta, no su velocidad. Una onda en la que las partículas oscilan perpendicularmente a la dirección de propagación se llama onda ___.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "f",
            alternativas_aceptadas: ["F"],
            pista: "v = ___ × λ, donde ___ es la frecuencia de la onda.",
          },
          {
            posicion: 1,
            respuesta_correcta: "0.005",
            alternativas_aceptadas: ["1/200", "0,005"],
            pista: "T = 1/f = 1/200 = ? s",
          },
          {
            posicion: 2,
            respuesta_correcta: "energía",
            alternativas_aceptadas: ["energia"],
            pista: "La amplitud está relacionada con la energía de la onda: E ∝ A². La ___ que transporta depende de la amplitud.",
          },
          {
            posicion: 3,
            respuesta_correcta: "transversal",
            alternativas_aceptadas: [],
            pista: "Cuando las partículas oscilan en dirección perpendicular a la propagación, la onda es ___.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Movimiento ondulatorio",
      descripcion: "Reflexiona sobre tu comprensión de las ondas mecánicas y sus características fundamentales.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Defino y distingo amplitud, frecuencia, período y longitud de onda de una onda mecánica.", escala: escala4 },
          { descripcion: "Aplico la ecuación v = f·λ para calcular velocidad, frecuencia o longitud de onda dados los otros dos.", escala: escala4 },
          { descripcion: "Distingo ondas transversales de longitudinales y doy ejemplos de cada tipo.", escala: escala4 },
          { descripcion: "Explico por qué la velocidad de una onda depende del medio y no de la amplitud ni la fuente.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Por qué el sonido no puede propagarse en el vacío pero la luz sí? ¿Qué diferencia fundamental entre las ondas mecánicas y las electromagnéticas explica este fenómeno?",
      },
    },
  ],

  // ════════════ P05 — Espectro electromagnético: aplicaciones tecnológicas y biomédicas ════════════
  [
    {
      titulo: "Verdadero o Falso — Espectro electromagnético",
      descripcion: "Decide si cada afirmación sobre el espectro electromagnético y sus aplicaciones tecnológicas y biomédicas es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "Las ondas de radio tienen la mayor longitud de onda del espectro electromagnético y la menor frecuencia.",
            respuesta: true,
            retroalimentacion: "Correcto. Las ondas de radio (longitudes de onda de milímetros a kilómetros) tienen la menor frecuencia y la mayor longitud de onda del espectro electromagnético.",
          },
          {
            enunciado: "Los rayos X tienen menor frecuencia que la luz visible porque la luz visible es la que el ojo humano puede detectar directamente.",
            respuesta: false,
            retroalimentacion: "Falso. Los rayos X tienen frecuencias mucho mayores (del orden de 10¹⁷ - 10¹⁹ Hz) que la luz visible (4×10¹⁴ - 7.5×10¹⁴ Hz). Mayor frecuencia implica mayor energía y menor longitud de onda.",
          },
          {
            enunciado: "Todas las ondas del espectro electromagnético se propagan en el vacío a la misma velocidad: c ≈ 3 × 10⁸ m/s.",
            respuesta: true,
            retroalimentacion: "Correcto. Todas las ondas electromagnéticas (radio, microondas, infrarrojo, visible, UV, rayos X y gamma) viajan en el vacío a c ≈ 3 × 10⁸ m/s.",
          },
          {
            enunciado: "Los rayos gamma tienen aplicaciones médicas limitadas porque su alta energía los hace incontrolables.",
            respuesta: false,
            retroalimentacion: "Falso. Los rayos gamma se usan en medicina nuclear (radioterapia para tratar tumores cancerígenos, gammagrafía, esterilización de equipos médicos). Su alta energía se aprovecha de manera controlada.",
          },
          {
            enunciado: "Los hornos de microondas calientan los alimentos porque las microondas hacen vibrar las moléculas de agua presentes en los alimentos.",
            respuesta: true,
            retroalimentacion: "Correcto. Las microondas tienen frecuencias que resuenan con las moléculas de agua (≈ 2.45 GHz), provocando su vibración y generando calor por fricción molecular.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Espectro electromagnético",
      descripcion: "Glosario interactivo sobre las bandas del espectro electromagnético y sus aplicaciones tecnológicas y biomédicas.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Espectro electromagnético",
            definicion: "Conjunto de todas las ondas electromagnéticas ordenadas por frecuencia (o longitud de onda). De menor a mayor frecuencia: radio, microondas, infrarrojo, luz visible, ultravioleta, rayos X, rayos gamma. Todas viajan a c ≈ 3 × 10⁸ m/s en el vacío.",
            ejemplo: "La luz visible ocupa solo una franja estrecha del espectro (400-700 nm), mientras que las ondas de radio pueden tener longitudes de onda de kilómetros.",
            etiquetas: ["espectro electromagnético", "frecuencia", "longitud de onda"],
          },
          {
            termino: "Ondas de radio y microondas",
            definicion: "Ondas de radio (f < 300 MHz, λ > 1 m): telecomunicaciones, radiodifusión AM/FM, WiFi. Microondas (300 MHz - 300 GHz): hornos, radar, telefonía móvil, satélites GPS.",
            ejemplo: "El WiFi de 2.4 GHz y 5 GHz usa microondas. Los radares aeroportuarios también operan en esta banda.",
            etiquetas: ["radio", "microondas", "telecomunicaciones"],
          },
          {
            termino: "Infrarrojo (IR)",
            definicion: "Longitudes de onda de 700 nm a 1 mm. Por debajo de la luz roja visible. Aplicaciones: control remoto, visión nocturna, termografía médica, calentadores.",
            ejemplo: "Las cámaras térmicas de bomberos o médicos detectan radiación infrarroja emitida por cuerpos calientes (todo cuerpo con T > 0 K emite IR).",
            etiquetas: ["infrarrojo", "termografía", "calor"],
          },
          {
            termino: "Luz visible",
            definicion: "Franja del espectro detectable por el ojo humano: longitudes de onda de 400 nm (violeta) a 700 nm (rojo). Incluye todos los colores del arcoíris: ROYGBIV.",
            ejemplo: "Un láser verde de 532 nm es luz visible. Los colores de una pantalla LED se producen combinando rojo (~650 nm), verde (~520 nm) y azul (~450 nm).",
            etiquetas: ["luz visible", "colores", "ojo"],
          },
          {
            termino: "Ultravioleta (UV) y rayos X",
            definicion: "UV (10-400 nm): produce vitamina D en la piel, esteriliza superficies, causa quemaduras. Rayos X (0.01-10 nm): diagnóstico médico (radiografías), seguridad aeroportuaria.",
            ejemplo: "Una radiografía de tórax usa rayos X que penetran tejidos blandos pero son absorbidos por huesos, revelando su estructura.",
            etiquetas: ["ultravioleta", "rayos X", "diagnóstico"],
          },
          {
            termino: "Rayos gamma",
            definicion: "Mayor frecuencia y energía del espectro (f > 10¹⁹ Hz, λ < 0.01 nm). Origen: núcleos radiactivos. Aplicaciones: radioterapia oncológica, gammagrafía, esterilización médica.",
            ejemplo: "El bisturí de rayos gamma (Gamma Knife) destruye tumores cerebrales con alta precisión sin cirugía convencional.",
            etiquetas: ["rayos gamma", "radioterapia", "oncología"],
          },
        ],
        actividad_final: "Elabora una tabla que ordene las bandas del espectro electromagnético de menor a mayor frecuencia, indicando para cada una: rango de longitud de onda aproximado, una aplicación tecnológica y una aplicación biomédica (si la tiene). Compara la energía de los rayos gamma con la de las ondas de radio usando la relación E = h·f.",
      },
    },
    {
      titulo: "Completa los espacios — Espectro electromagnético",
      descripcion: "Completa los enunciados clave sobre el espectro electromagnético y sus aplicaciones.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o valor correcto.",
        texto_con_huecos: "Todas las ondas electromagnéticas viajan en el vacío a c ≈ ___ × 10⁸ m/s. La banda del espectro electromagnético con mayor longitud de onda es la de las ondas de ___. Los hornos de microondas calientan alimentos haciendo vibrar las moléculas de ___. Los ___ X se usan en medicina para obtener imágenes del interior del cuerpo humano.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "3",
            alternativas_aceptadas: ["3.0", "3,0"],
            pista: "La velocidad de la luz en el vacío es c ≈ ___ × 10⁸ m/s.",
          },
          {
            posicion: 1,
            respuesta_correcta: "radio",
            alternativas_aceptadas: ["Radio"],
            pista: "Las ondas con mayor longitud de onda (y menor frecuencia) del espectro EM son las ondas de ___.",
          },
          {
            posicion: 2,
            respuesta_correcta: "agua",
            alternativas_aceptadas: ["H2O", "h2o"],
            pista: "Los alimentos contienen moléculas de ___ que absorben la energía de las microondas y se calientan.",
          },
          {
            posicion: 3,
            respuesta_correcta: "rayos",
            alternativas_aceptadas: ["Rayos"],
            pista: "Los ___ X atraviesan tejidos blandos y son absorbidos por el hueso, permitiendo las radiografías.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Espectro electromagnético",
      descripcion: "Reflexiona sobre tu comprensión del espectro electromagnético y sus aplicaciones tecnológicas y biomédicas.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Ordeno las bandas del espectro electromagnético por frecuencia (o longitud de onda) y menciono una aplicación de cada una.", escala: escala4 },
          { descripcion: "Explico por qué todas las ondas electromagnéticas viajan a la misma velocidad en el vacío (c ≈ 3 × 10⁸ m/s).", escala: escala4 },
          { descripcion: "Relaciono la frecuencia de una onda electromagnética con su energía y su capacidad de penetración en la materia.", escala: escala4 },
          { descripcion: "Identifico aplicaciones tecnológicas (radar, WiFi, microondas) y biomédicas (rayos X, radioterapia, termografía) de distintas bandas del espectro.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Por qué es importante usar bloqueador solar cuando nos exponemos a la luz del Sol? ¿Qué banda del espectro electromagnético nos protegemos al usarlo y cuál es el mecanismo de daño biológico?",
      },
    },
  ],

  // ════════════ P06 — Fenómenos ópticos: reflexión, refracción, dispersión ════════════
  [
    {
      titulo: "Verdadero o Falso — Fenómenos ópticos",
      descripcion: "Decide si cada afirmación sobre la reflexión, refracción, dispersión de la luz y la ley de Snell es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "En la reflexión de la luz, el ángulo de incidencia (medido respecto a la normal) es siempre igual al ángulo de reflexión.",
            respuesta: true,
            retroalimentacion: "Correcto. Esta es la ley de reflexión: θᵢ = θᵣ, donde ambos ángulos se miden respecto a la normal a la superficie reflectante.",
          },
          {
            enunciado: "La ley de Snell establece que n₁·sen(θ₁) = n₂·sen(θ₂), donde n es el índice de refracción del medio.",
            respuesta: true,
            retroalimentacion: "Correcto. La ley de Snell-Descartes describe cuánto cambia la dirección de la luz al pasar de un medio con índice n₁ a otro con índice n₂.",
          },
          {
            enunciado: "Cuando la luz pasa del agua (n ≈ 1.33) al aire (n = 1), la luz se acerca a la normal porque pasa a un medio más denso.",
            respuesta: false,
            retroalimentacion: "Falso. Al pasar del agua al aire, la luz pasa a un medio menos denso (n menor), por lo que el rayo se aleja de la normal (el ángulo de refracción es mayor que el de incidencia).",
          },
          {
            enunciado: "La dispersión de la luz blanca a través de un prisma separa los colores porque cada longitud de onda tiene un índice de refracción ligeramente diferente en el vidrio.",
            respuesta: true,
            retroalimentacion: "Correcto. La dispersión ocurre porque el índice de refracción del vidrio varía con la longitud de onda: la luz violeta se refracta más que la roja, separando los colores.",
          },
          {
            enunciado: "Una lente convergente (convexa) hace que los rayos paralelos al eje óptico divergan después de atravesarla.",
            respuesta: false,
            retroalimentacion: "Falso. Una lente convergente (convexa) hace que los rayos paralelos al eje óptico converjan en un punto llamado foco principal. Las lentes divergentes (cóncavas) son las que dispersan los rayos.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Óptica: reflexión, refracción y dispersión",
      descripcion: "Glosario interactivo sobre los fenómenos ópticos de reflexión, refracción y dispersión, la ley de Snell, y la óptica de lentes.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Reflexión de la luz",
            definicion: "Cambio de dirección de la luz al rebotar sobre una superficie. Ley: el ángulo de incidencia θᵢ es igual al ángulo de reflexión θᵣ (ambos medidos respecto a la normal). Reflexión especular: superficie lisa. Reflexión difusa: superficie rugosa.",
            ejemplo: "Un espejo plano produce reflexión especular. Una pared blanca produce reflexión difusa, permitiendo ver objetos desde distintos ángulos.",
            etiquetas: ["reflexión", "ley de reflexión", "espejo"],
          },
          {
            termino: "Refracción de la luz",
            definicion: "Cambio de dirección y velocidad de la luz al pasar de un medio a otro con diferente índice de refracción. Ley de Snell: n₁·sen(θ₁) = n₂·sen(θ₂).",
            ejemplo: "Un lápiz sumergido en agua parece doblado porque la luz cambia de dirección al pasar del agua (n ≈ 1.33) al aire (n = 1).",
            etiquetas: ["refracción", "ley de Snell", "índice de refracción"],
          },
          {
            termino: "Índice de refracción (n)",
            definicion: "Razón entre la velocidad de la luz en el vacío (c) y su velocidad en el medio: n = c/v. El vacío tiene n = 1. Medios más densos tienen mayor n (aire ≈ 1.00, agua ≈ 1.33, vidrio ≈ 1.5, diamante ≈ 2.42).",
            ejemplo: "En el diamante (n = 2.42), la luz viaja a v = c/2.42 ≈ 1.24 × 10⁸ m/s.",
            etiquetas: ["índice de refracción", "velocidad de la luz"],
          },
          {
            termino: "Dispersión de la luz",
            definicion: "Separación de la luz blanca en sus colores componentes porque el índice de refracción depende de la longitud de onda. La luz violeta se refracta más que la roja en el vidrio.",
            ejemplo: "Un prisma de vidrio descompone la luz blanca en el espectro visible (arcoíris). El arcoíris natural se debe a la dispersión de la luz solar en gotas de agua.",
            etiquetas: ["dispersión", "prisma", "arcoíris"],
          },
          {
            termino: "Reflexión total interna",
            definicion: "Cuando la luz viaja de un medio más denso a uno menos denso y el ángulo de incidencia supera el ángulo crítico, la luz se refleja totalmente sin refractarse. Base de las fibras ópticas.",
            ejemplo: "Las fibras ópticas de internet usan reflexión total interna para transmitir señales luminosas a larga distancia sin pérdidas significativas.",
            etiquetas: ["reflexión total interna", "fibra óptica", "ángulo crítico"],
          },
          {
            termino: "Lentes convergentes y divergentes",
            definicion: "Lente convergente (convexa): refracta los rayos hacia el eje óptico; tiene foco real. Aplicaciones: lupas, cámaras, corrección de hipermetropía. Lente divergente (cóncava): dispersa los rayos; tiene foco virtual. Aplicaciones: corrección de miopía.",
            ejemplo: "Las gafas con lentes negativas (cóncavas) corrigen la miopía al divergir los rayos antes de entrar al ojo, moviendo el foco hacia la retina.",
            etiquetas: ["lentes", "convergente", "divergente", "visión"],
          },
        ],
        actividad_final: "Un rayo de luz pasa del aire (n₁ = 1.00) al vidrio (n₂ = 1.50) con un ángulo de incidencia de 30°. (a) Usa la ley de Snell para calcular el ángulo de refracción. (b) ¿El rayo se acerca o se aleja de la normal al entrar al vidrio? Justifica con el principio de Snell.",
      },
    },
    {
      titulo: "Completa los espacios — Fenómenos ópticos",
      descripcion: "Completa los enunciados clave sobre reflexión, refracción, ley de Snell y lentes.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o valor correcto.",
        texto_con_huecos: "La ley de reflexión establece que el ángulo de incidencia es ___ al ángulo de reflexión. La ley de Snell se expresa como n₁·sen(θ₁) = n₂·___. La dispersión de la luz blanca en un prisma ocurre porque el índice de refracción depende de la ___ de onda. Las fibras ópticas funcionan gracias al fenómeno de reflexión ___ interna.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "igual",
            alternativas_aceptadas: ["equivalente"],
            pista: "En la reflexión: ángulo de incidencia ___ ángulo de reflexión (ambos medidos desde la normal).",
          },
          {
            posicion: 1,
            respuesta_correcta: "sen(θ₂)",
            alternativas_aceptadas: ["sen(θ2)", "sin(θ2)", "sin(θ₂)"],
            pista: "La ley de Snell: n₁·sen(θ₁) = n₂·___(θ₂).",
          },
          {
            posicion: 2,
            respuesta_correcta: "longitud",
            alternativas_aceptadas: ["Long"],
            pista: "La dispersión ocurre porque el índice de refracción varía con la ___ de onda de la luz.",
          },
          {
            posicion: 3,
            respuesta_correcta: "total",
            alternativas_aceptadas: [],
            pista: "Cuando la luz no puede salir del medio más denso y se refleja por completo, ocurre la reflexión ___ interna.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Fenómenos ópticos",
      descripcion: "Reflexiona sobre tu comprensión de la reflexión, refracción, dispersión de la luz y sus aplicaciones tecnológicas y en la visión.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Enuncio la ley de reflexión (θᵢ = θᵣ) y la aplico a ejemplos con espejos planos.", escala: escala4 },
          { descripcion: "Aplico la ley de Snell n₁·sen(θ₁) = n₂·sen(θ₂) para calcular ángulos de refracción.", escala: escala4 },
          { descripcion: "Explico la dispersión de la luz (prisma, arcoíris) y la reflexión total interna (fibras ópticas).", escala: escala4 },
          { descripcion: "Relaciono los fenómenos ópticos con la visión humana y tecnologías (cámaras, lentes correctivos, endoscopios).", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Por qué vemos el cielo azul durante el día y colores rojizos al atardecer? Relaciona tu respuesta con la dispersión y la longitud de onda de la luz. ¿Qué fenómeno óptico explica el arcoíris?",
      },
    },
  ],

  // ════════════ P07 — Electromagnetismo: motores, generadores y tecnologías ════════════
  [
    {
      titulo: "Verdadero o Falso — Electromagnetismo",
      descripcion: "Decide si cada afirmación sobre los principios del electromagnetismo y su aplicación en motores, generadores y tecnologías cotidianas es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La ley de Faraday establece que un campo magnético variable en el tiempo induce una fuerza electromotriz (fem) en un circuito conductor.",
            respuesta: true,
            retroalimentacion: "Correcto. La ley de inducción de Faraday: fem = −dΦ_B/dt, donde Φ_B es el flujo magnético. Un campo magnético que cambia induce corriente en un conductor cercano.",
          },
          {
            enunciado: "Un motor eléctrico convierte energía eléctrica en energía mecánica, mientras que un generador eléctrico convierte energía mecánica en energía eléctrica.",
            respuesta: true,
            retroalimentacion: "Correcto. Motor: electricidad → movimiento (usa la fuerza sobre corrientes en campos magnéticos). Generador: movimiento → electricidad (usa la inducción electromagnética de Faraday).",
          },
          {
            enunciado: "El transformador eléctrico puede aumentar o disminuir la tensión de corriente directa (CD) con alta eficiencia.",
            respuesta: false,
            retroalimentacion: "Falso. Los transformadores convencionales solo funcionan con corriente alterna (CA), ya que necesitan un campo magnético variable para inducir voltaje en el secundario. La corriente directa produce un campo constante que no induce fem.",
          },
          {
            enunciado: "Las ondas de radio y televisión son generadas por cargas eléctricas oscilantes que crean campos electromagnéticos variables que se propagan como ondas.",
            respuesta: true,
            retroalimentacion: "Correcto. Cargas aceleradas (oscilantes) generan campos eléctricos y magnéticos variables que se propagan como ondas electromagnéticas, principio detrás de toda radiodifusión.",
          },
          {
            enunciado: "La regla de la mano derecha permite determinar la dirección del campo magnético creado por una corriente eléctrica en un conductor recto.",
            respuesta: true,
            retroalimentacion: "Correcto. Con el pulgar derecho apuntando en la dirección de la corriente convencional, los dedos curvados señalan la dirección del campo magnético circular alrededor del conductor.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Electromagnetismo aplicado",
      descripcion: "Glosario interactivo sobre la ley de Faraday, inducción electromagnética, motores, generadores, transformadores y tecnologías cotidianas.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Ley de Faraday (inducción electromagnética)",
            definicion: "Una variación del flujo magnético (Φ_B) a través de un circuito induice una fuerza electromotriz: fem = −ΔΦ_B/Δt. El signo negativo indica que la corriente inducida se opone al cambio (ley de Lenz).",
            ejemplo: "Al mover un imán hacia o alejándolo de una bobina, el galvanómetro detecta una corriente inducida. Esta es la base de los generadores eléctricos.",
            etiquetas: ["Faraday", "inducción electromagnética", "fem"],
          },
          {
            termino: "Motor eléctrico",
            definicion: "Dispositivo que convierte energía eléctrica en energía mecánica usando la fuerza que ejerce un campo magnético sobre un conductor que lleva corriente (fuerza de Lorentz: F = I·L × B).",
            ejemplo: "Los motores de los automóviles eléctricos, ventiladores, lavadoras y taladros son motores eléctricos. Un Tesla Model 3 usa un motor de corriente alterna de inducción.",
            etiquetas: ["motor eléctrico", "energía mecánica", "Lorentz"],
          },
          {
            termino: "Generador eléctrico (alternador)",
            definicion: "Dispositivo que convierte energía mecánica en energía eléctrica mediante la inducción electromagnética: una bobina giratoria en un campo magnético genera corriente alterna.",
            ejemplo: "Las plantas hidroeléctricas, termoeléctricas y eólicas utilizan generadores: el movimiento mecánico (turbinas) induce corriente eléctrica.",
            etiquetas: ["generador", "alternador", "turbina"],
          },
          {
            termino: "Transformador eléctrico",
            definicion: "Dispositivo que aumenta (transformador elevador) o disminuye (reductor) la tensión de CA usando inducción mutua entre dos bobinas. Relación: V₁/V₂ = N₁/N₂, donde N es el número de espiras.",
            ejemplo: "La red eléctrica transmite a alta tensión (230 kV) para reducir pérdidas; transformadores reductores bajan la tensión a 127/220 V para uso doméstico.",
            etiquetas: ["transformador", "tensión", "bobina"],
          },
          {
            termino: "Campo magnético y corriente eléctrica",
            definicion: "Una corriente eléctrica genera un campo magnético circular alrededor del conductor (ley de Ampère). Un electroimán es un conductor en bobina que intensifica este campo.",
            ejemplo: "La resonancia magnética (IRM) hospitalaria usa electroimanes superconductores que generan campos de 1.5-3 T para obtener imágenes del interior del cuerpo.",
            etiquetas: ["campo magnético", "electroimán", "Ampère"],
          },
          {
            termino: "Tecnologías cotidianas del electromagnetismo",
            definicion: "Inducción electromagnética aplicada a: cargadores inalámbricos (inducción), tarjetas de transporte (RFID), cocinas de inducción, bocinas, micrófonos, discos duros.",
            ejemplo: "La cocina de inducción genera corrientes de Foucault en la sartén metálica mediante un campo magnético variable, calentando solo el recipiente sin calentar la vitrocerámica.",
            etiquetas: ["tecnología", "inducción", "aplicaciones"],
          },
        ],
        actividad_final: "Explica con tus propias palabras cómo una planta hidroeléctrica convierte la energía potencial del agua en energía eléctrica que llega a tu hogar. Menciona al menos tres principios electromagnéticos involucrados en el proceso completo (desde la turbina hasta el enchufe doméstico).",
      },
    },
    {
      titulo: "Completa los espacios — Electromagnetismo",
      descripcion: "Completa los enunciados clave sobre la ley de Faraday, motores, generadores y transformadores.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o expresión correcta.",
        texto_con_huecos: "La ley de Faraday establece que una variación del ___ magnético induce una fuerza electromotriz en un circuito. Un motor eléctrico convierte energía eléctrica en energía ___. En un transformador, si el bobinado primario tiene N₁ espiras y el secundario N₂, la relación de voltajes es V₁/V₂ = N₁/___. Las cocinas de inducción calientan los alimentos mediante corrientes de ___.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "flujo",
            alternativas_aceptadas: ["campo"],
            pista: "La ley de Faraday dice que fem = −ΔΦ_B/Δt; ΔΦ_B es la variación del ___ magnético.",
          },
          {
            posicion: 1,
            respuesta_correcta: "mecánica",
            alternativas_aceptadas: ["mecanica"],
            pista: "El motor transforma la energía eléctrica de entrada en energía ___ de salida (movimiento).",
          },
          {
            posicion: 2,
            respuesta_correcta: "N₂",
            alternativas_aceptadas: ["N2"],
            pista: "La relación de transformación es V₁/V₂ = N₁/___, donde N₂ es el número de espiras del secundario.",
          },
          {
            posicion: 3,
            respuesta_correcta: "Foucault",
            alternativas_aceptadas: ["foucault"],
            pista: "Las corrientes inducidas en el fondo metálico de la sartén se llaman corrientes de ___.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Electromagnetismo",
      descripcion: "Reflexiona sobre tu comprensión de los principios del electromagnetismo y su aplicación en motores, generadores y tecnologías cotidianas.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Enuncio la ley de Faraday y explico cómo la variación del flujo magnético induce una fem.", escala: escala4 },
          { descripcion: "Distingo el funcionamiento de un motor eléctrico (electricidad → movimiento) del de un generador (movimiento → electricidad).", escala: escala4 },
          { descripcion: "Explico el principio del transformador y calculo relaciones de voltaje usando V₁/V₂ = N₁/N₂.", escala: escala4 },
          { descripcion: "Identifico al menos tres tecnologías cotidianas que aplican principios electromagnéticos y explico su funcionamiento básico.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Cómo sería tu vida cotidiana sin el electromagnetismo? Describe tres dispositivos que usas a diario y explica qué principio electromagnético los hace funcionar (motor, generador, transformador, inducción).",
      },
    },
  ],

  // ════════════ P08 — Ética del desarrollo tecnológico en física: energía nuclear y telecomunicaciones ════════════
  [
    {
      titulo: "Verdadero o Falso — Ética y tecnología en física",
      descripcion: "Decide si cada afirmación sobre las implicaciones éticas y sociales de la energía nuclear y las telecomunicaciones es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La fisión nuclear consiste en la división de núcleos pesados (como el uranio-235) liberando grandes cantidades de energía según E = mc².",
            respuesta: true,
            retroalimentacion: "Correcto. En la fisión nuclear, núcleos pesados se dividen en núcleos más ligeros, liberando energía según la ecuación de Einstein E = mc², donde la pequeña diferencia de masa se convierte en enorme cantidad de energía.",
          },
          {
            enunciado: "Las plantas nucleares no emiten gases de efecto invernadero durante su operación normal, lo que las hace completamente inocuas para el medio ambiente.",
            respuesta: false,
            retroalimentacion: "Falso. Si bien las plantas nucleares tienen bajas emisiones de CO₂ en operación, generan residuos radiactivos de larga vida que representan un desafío ambiental y ético significativo.",
          },
          {
            enunciado: "La brecha digital es una desigualdad social en la que ciertos grupos no tienen acceso a tecnologías de telecomunicación como internet o telefonía, lo que limita sus oportunidades.",
            respuesta: true,
            retroalimentacion: "Correcto. La brecha digital es una problemática ética y social real: el acceso desigual a las TIC amplía las desigualdades educativas, económicas y sociales.",
          },
          {
            enunciado: "La fusión nuclear, proceso que ocurre en el Sol, ya es utilizada comercialmente como fuente de energía eléctrica en plantas de fusión operativas alrededor del mundo.",
            respuesta: false,
            retroalimentacion: "Falso. La fusión nuclear controlada todavía no es comercialmente viable. Proyectos como ITER en Francia buscan demostrar su viabilidad, pero a 2026 aún no existen plantas de fusión comerciales.",
          },
          {
            enunciado: "La privacidad de los datos personales es una implicación ética de las telecomunicaciones modernas, ya que las redes de comunicación pueden almacenar y transmitir información privada de los usuarios.",
            respuesta: true,
            retroalimentacion: "Correcto. El manejo ético de los datos personales es un desafío central de las telecomunicaciones modernas, regulado en muchos países por leyes de protección de datos (como el GDPR en Europa o la LFPDPPP en México).",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Ética, energía nuclear y telecomunicaciones",
      descripcion: "Glosario interactivo sobre los conceptos clave de la energía nuclear, telecomunicaciones y sus implicaciones éticas y sociales.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Fisión nuclear",
            definicion: "Proceso en el que un núcleo atómico pesado (como ²³⁵U) absorbe un neutrón y se divide en núcleos más ligeros, liberando energía (E = mc²) y más neutrones que pueden provocar una reacción en cadena.",
            ejemplo: "Los reactores nucleares de fisión generan calor que produce vapor para mover turbinas. La planta de Laguna Verde en Veracruz, México, opera con este principio.",
            etiquetas: ["fisión", "energía nuclear", "reactor"],
          },
          {
            termino: "Fusión nuclear",
            definicion: "Proceso en el que dos núcleos ligeros (como deuterio y tritio, isótopos del hidrógeno) se fusionan formando un núcleo más pesado y liberando enorme cantidad de energía. Es la fuente de energía del Sol.",
            ejemplo: "El Sol fusiona ~620 millones de toneladas de hidrógeno cada segundo, liberando energía equivalente a 3.8 × 10²⁶ W.",
            etiquetas: ["fusión", "Sol", "energía"],
          },
          {
            termino: "Radiactividad y residuos nucleares",
            definicion: "Los materiales radiactivos emiten partículas o radiación al desintegrarse. Los residuos nucleares de alta actividad pueden permanecer peligrosos durante miles de años, representando un desafío ético de almacenamiento seguro para generaciones futuras.",
            ejemplo: "El plutonio-239, producto de los reactores, tiene una vida media de 24 100 años, lo que plantea el dilema ético de legar estos residuos a futuras generaciones.",
            etiquetas: ["radiactividad", "residuos nucleares", "ética"],
          },
          {
            termino: "Brecha digital",
            definicion: "Desigualdad en el acceso y uso de tecnologías de la información y comunicación (TIC) entre diferentes grupos sociales, regiones geográficas o países. Tiene implicaciones éticas sobre equidad educativa y oportunidades.",
            ejemplo: "En México, las comunidades rurales indígenas tienen menor acceso a internet que las zonas urbanas, limitando el acceso a educación digital y oportunidades laborales.",
            etiquetas: ["brecha digital", "equidad", "telecomunicaciones"],
          },
          {
            termino: "Ética tecnológica",
            definicion: "Reflexión sobre las consecuencias morales, sociales y ambientales del desarrollo y uso de tecnologías. Incluye preguntas sobre quién se beneficia, quién asume los riesgos, y la responsabilidad de los desarrolladores y gobiernos.",
            ejemplo: "El despliegue de redes 5G genera debates éticos sobre privacidad, vigilancia digital, impacto ambiental de la infraestructura y acceso igualitario.",
            etiquetas: ["ética", "tecnología", "responsabilidad"],
          },
          {
            termino: "Principio de precaución",
            definicion: "Principio ético y político según el cual ante la incertidumbre sobre riesgos de daño grave o irreversible (ambiental, de salud), se deben tomar medidas preventivas aunque no haya certeza científica absoluta.",
            ejemplo: "La moratoria sobre pruebas nucleares en zonas habitadas y el debate sobre el almacenamiento de residuos radiactivos aplican el principio de precaución.",
            etiquetas: ["precaución", "riesgo", "política"],
          },
        ],
        actividad_final: "Selecciona una tecnología física de alto impacto (energía nuclear, 5G, inteligencia artificial, satélites de comunicación) y analiza: (a) beneficios científicos o sociales, (b) riesgos éticos o ambientales, (c) quiénes se ven más beneficiados y quiénes asumen más riesgos. Presenta una postura argumentada.",
      },
    },
    {
      titulo: "Completa los espacios — Ética y tecnología en física",
      descripcion: "Completa los enunciados sobre energía nuclear, telecomunicaciones y sus implicaciones éticas.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o expresión correcta.",
        texto_con_huecos: "La ecuación de Einstein que relaciona masa y energía en los procesos nucleares es E = ___. La fisión nuclear libera energía al ___ núcleos atómicos pesados. La fusión nuclear es la fuente de energía que ocurre en el ___. La desigualdad en el acceso a las tecnologías de comunicación se denomina ___ digital.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "mc²",
            alternativas_aceptadas: ["m·c²", "mc^2"],
            pista: "La famosa ecuación de Einstein: E = ___ (masa por velocidad de la luz al cuadrado).",
          },
          {
            posicion: 1,
            respuesta_correcta: "dividir",
            alternativas_aceptadas: ["separar", "fragmentar"],
            pista: "La fisión nuclear consiste en ___ (partir) núcleos pesados en núcleos más pequeños.",
          },
          {
            posicion: 2,
            respuesta_correcta: "Sol",
            alternativas_aceptadas: ["sol", "el Sol"],
            pista: "La fusión nuclear es el proceso que proporciona energía al ___, nuestra estrella.",
          },
          {
            posicion: 3,
            respuesta_correcta: "brecha",
            alternativas_aceptadas: [],
            pista: "La ___ digital describe la desigualdad de acceso a internet y tecnologías entre distintos grupos sociales.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Ética del desarrollo tecnológico en física",
      descripcion: "Reflexiona sobre tu capacidad para analizar críticamente las implicaciones éticas y sociales del desarrollo tecnológico en física.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Distingo fisión de fusión nuclear y explico el principio físico (E = mc²) detrás de la liberación de energía.", escala: escala4 },
          { descripcion: "Analizo los beneficios y riesgos de la energía nuclear (residuos, proliferación, bajo CO₂) con argumentos equilibrados.", escala: escala4 },
          { descripcion: "Identifico implicaciones éticas de las telecomunicaciones (privacidad, brecha digital, vigilancia) y adopto una postura fundamentada.", escala: escala4 },
          { descripcion: "Aplico el principio de precaución para evaluar decisiones tecnológicas con riesgos inciertos para la sociedad y el medio ambiente.", escala: escala4 },
        ],
        reflexion_final_prompt: "Si tuvieras que votar como ciudadano sobre construir una planta nuclear en tu región, ¿cuáles serían tus argumentos a favor y en contra? ¿Qué información científica y ética considerarías esencial antes de tomar una decisión?",
      },
    },
  ],
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
