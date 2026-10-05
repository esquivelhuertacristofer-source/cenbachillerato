/**
 * PREDICE — la pregunta con la que se entra a un laboratorio.
 *
 * Sustituye al muro de «conceptos por descubrir» que el alumno saltaba. En vez
 * de leer antes de tocar, apuesta: una pregunta, tres respuestas con dibujo y
 * un clic. Luego el laboratorio confirma o desmiente la apuesta, y después del
 * laboratorio se revela por qué (predecir → observar → explicar).
 *
 * Reglas para escribir una:
 *   · La respuesta se tiene que poder VER en el laboratorio moviendo algo; si
 *     no, no es una predicción, es un examen.
 *   · Las tres opciones son plausibles; la correcta no es la más larga.
 *   · `pregunta` ≤ 20 palabras, cada opción ≤ 10, `porque` ≤ 45.
 *   · `comoComprobarlo` dice qué mover, no qué va a pasar.
 *
 * Los conceptos de la ficha no se pierden: al apostar caen en el cuaderno.
 */

export interface OpcionPrediccion {
  id: string;
  texto: string;
  /** Ícono de Font Awesome (sin `fa-solid`). */
  icono: string;
}

export interface Prediccion {
  pregunta: string;
  /** Una línea que pone la escena antes de la pregunta. */
  escena?: string;
  opciones: OpcionPrediccion[];
  correcta: string;
  porque: string;
  comoComprobarlo: string;
}

import { PREDICCIONES_LABS } from "./predicciones-labs.generated";

export const PREDICCIONES: Record<string, Prediccion> = {
  // Las de la migración general (docs/ESTANDAR-LABS.md §7); las de abajo, escritas a mano, mandan.
  ...PREDICCIONES_LABS,
  "dcl-leyes-newton": {
    escena: "Una caja de 2 kg reposa sobre una rampa de madera casi plana.",
    pregunta: "Si levantas la rampa poco a poco, ¿qué le pasa a la caja?",
    opciones: [
      { id: "a", texto: "Se desliza en cuanto la rampa se inclina", icono: "fa-person-skiing" },
      { id: "b", texto: "Aguanta quieta y, a cierto ángulo, de golpe desliza", icono: "fa-stopwatch" },
      { id: "c", texto: "Nunca se mueve: la fricción siempre la sostiene", icono: "fa-anchor" },
    ],
    correcta: "b",
    porque:
      "La fricción estática crece para igualar a m·g·senθ, pero tiene un tope: μs·N. Mientras el peso a favor de la rampa no lo supere, ΣF = 0 y la caja no se mueve. Con μs = 0.3 eso pasa cerca de 17°.",
    comoComprobarlo: "En «Plano inclinado», baja el ángulo θ a 5° y súbelo poco a poco. Mira cuándo aparece la aceleración.",
  },
  "balanceo-ecuaciones": {
    escena: "El hierro de una reja se oxida con el oxígeno del aire y forma herrumbre.",
    pregunta: "En Fe + O₂ → Fe₂O₃, ¿cuántos átomos de oxígeno quedan en cada lado ya balanceada?",
    opciones: [
      { id: "a", texto: "2 de cada lado: los que trae O₂", icono: "fa-2" },
      { id: "b", texto: "3 de cada lado: los que trae Fe₂O₃", icono: "fa-3" },
      { id: "c", texto: "6 de cada lado", icono: "fa-6" },
    ],
    correcta: "c",
    porque:
      "Los subíndices no se tocan: Fe₂O₃ trae 3 O y O₂ trae 2. El mínimo común múltiplo es 6, así que hacen falta 3 O₂ y 2 Fe₂O₃; luego 4 Fe igualan el hierro: 4 Fe + 3 O₂ → 2 Fe₂O₃.",
    comoComprobarlo: "Elige «Oxidación del hierro» y mueve los coeficientes. Mira la fila del oxígeno en la tabla de átomos.",
  },
  "genetica-mendeliana-punnett": {
    escena: "Una planta de flor morada Aa se cruza con una de flor blanca aa.",
    pregunta: "Si cruzas Aa × aa, ¿qué parte de la descendencia tiene flor blanca?",
    opciones: [
      { id: "a", texto: "Ninguna: el alelo dominante siempre gana", icono: "fa-crown" },
      { id: "b", texto: "La mitad, 50 %", icono: "fa-circle-half-stroke" },
      { id: "c", texto: "Una cuarta parte, 25 %", icono: "fa-chart-pie" },
    ],
    correcta: "b",
    porque:
      "El heterocigoto Aa da dos tipos de gametos, A y a, por partes iguales; el aa solo aporta a. Las cuatro casillas del cuadro dan 2 Aa y 2 aa: la mitad de los hijos es aa y muestra el rasgo recesivo.",
    comoComprobarlo: "En «Monohíbrido», pon un progenitor en Aa y el otro en aa (o usa la retrocruza). Lee P(aa).",
  },
  "deteccion-fake-news": {
    escena: "Una foto de una calle inundada se viraliza como «hoy en tu ciudad».",
    pregunta: "¿Qué herramienta revela más rápido si la foto es engañosa?",
    opciones: [
      { id: "a", texto: "Ver cuántas veces se compartió", icono: "fa-share-nodes" },
      { id: "b", texto: "Buscar la imagen (búsqueda inversa)", icono: "fa-magnifying-glass" },
      { id: "c", texto: "Contar los seguidores de la cuenta", icono: "fa-users" },
    ],
    correcta: "b",
    porque:
      "La búsqueda inversa muestra dónde y cuándo apareció antes la misma foto. Si es de otro año o de otro lugar, es material real fuera de contexto. Compartidos y seguidores no prueban si una imagen es auténtica ni actual.",
    comoComprobarlo: "En «Tu feed», abre la publicación 1 y pulsa «Buscar la imagen». Compara con lo que dicen las otras herramientas.",
  },
  "politicas-publicas": {
    escena: "San Isidro del Valle tiene 28 % de abandono escolar y 10 millones (simulados) de presupuesto.",
    pregunta: "Si gastas casi todo en lo más popular, pantallas y beca para todos, ¿qué pasa con el abandono?",
    opciones: [
      { id: "a", texto: "Baja mucho, más de 10 puntos", icono: "fa-arrow-trend-down" },
      { id: "b", texto: "Casi no baja, aunque la gente aplaude", icono: "fa-hand-holding-heart" },
      { id: "c", texto: "Sube porque se acaba el dinero", icono: "fa-arrow-trend-up" },
    ],
    correcta: "b",
    porque:
      "Lo popular no ataca las causas de raíz (transporte y falta de seguimiento). Sube la satisfacción, pero el abandono baja apenas unos puntos y la equidad cae.",
    comoComprobarlo: "En «Diseñar» elige Pantallas y Beca igual para todos; en «Evaluar» compara con un diseño que ataque las causas de raíz.",
  },
};
