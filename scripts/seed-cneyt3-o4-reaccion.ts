/**
 * Seed del propósito formativo CNEYT-III·O4 (numero=4) — hueco del re-alineamiento 2025.
 *
 *   Propósito formativo O4 (verbatim, contenido-2025.ts CNEYT-III propositos[3]):
 *     "Analiza la estructura de una reacción química para comprender su importancia
 *      como proceso de transformación de la materia."
 *   Contenido formativo C4 (verbatim, contenido-2025.ts CNEYT-III contenidos[3]):
 *     "Concepto de reacción química · Estructura de una reacción química · Ecuación
 *      química como forma de representar una reacción · Simbología utilizada en
 *      fórmulas y reacciones químicas"
 *
 * Crea la progresión CNEYT-III-P09 (numero=4) + 7 actividades, TODAS estado='borrador'
 * (regla: el contenido nuevo queda sin publicar hasta aprobación explícita).
 * La actividad A2 (ejercicio_matematico) lleva el laboratorio 3D "estructura-reaccion".
 *
 * Idempotente: upsert por "codigo". Recuenta uac.total_progresiones al final.
 *
 * Uso:
 *   npx tsx scripts/seed-cneyt3-o4-reaccion.ts            (dry-run: solo describe)
 *   npx tsx scripts/seed-cneyt3-o4-reaccion.ts --apply    (aplica los upserts)
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createSB, upsertActividad, type ActividadInput, type SB } from "./lib/activity-utils";

const UAC_CODIGO = "CNEYT-III";
const PROG_CODIGO = "CNEYT-III-P09";
const PROG_NUMERO = 4;
const LAB_SLUG = "estructura-reaccion";

const META = "Construya explicaciones sobre fenómenos naturales que subyacen a la estructura y función de sistemas o esferas terrestres, y comprenda su importancia para la existencia de la vida en la Tierra, así como la relevancia de las acciones humanas para su cuidado.";

// Propósito y contenido VERBATIM (contenido-2025.ts CNEYT-III)
const O4 = "Analiza la estructura de una reacción química para comprender su importancia como proceso de transformación de la materia.";
const C4 = "Concepto de reacción química Estructura de una reacción química Ecuación química como forma de representar una reacción Simbología utilizada en fórmulas y reacciones químicas";

const PROGRESION = {
  codigo: PROG_CODIGO,
  numero: PROG_NUMERO,
  titulo: O4,
  descripcion: "Estudia qué es una reacción química —un proceso donde unas sustancias (reactivos) se transforman en otras nuevas (productos)— y cómo se representa con una ecuación química. Aprende a leer su estructura: reactivos a la izquierda, la flecha → que indica «se transforma en», y productos a la derecha; el papel de los coeficientes (cuántas moléculas) frente a los subíndices (cuántos átomos por molécula), y la simbología de los estados de agregación (s), (l), (g), (ac), la flecha doble ⇌ de las reacciones reversibles y la Δ del calor. Comprueba la ley de conservación de la materia de Lavoisier contando los átomos de cada elemento en ambos lados, con ejemplos reales de México: la combustión del gas LP en la estufa, la fotosíntesis del maíz, la síntesis del amoniaco de los fertilizantes y la neutralización de un antiácido.",
  descripcion_extendida: `${O4} Contenidos formativos: ${C4}.`,
  meta_aprendizaje: META,
  categoria: "Nuestro hogar. El sistema terrestre",
  subcategoria: "Estructura de una reacción química",
  ejes_articuladores: ["Pensamiento crítico"],
  transversalidades: [] as string[],
  tiempo_estimado_horas: 3,
};

type Act = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido"> & { estado: "borrador" };

const ACTIVIDADES: Act[] = [
  // ── A1 — LECTURA ──────────────────────────────────────────────────────────
  {
    titulo: "Anatomía de una reacción química: cómo se escribe la transformación de la materia",
    descripcion: "Lee qué es una reacción química y cómo leer su ecuación: reactivos, flecha, productos, coeficientes, subíndices y la simbología de fórmulas y estados.",
    tipo: "lectura",
    xp: 10,
    estado: "borrador",
    contenido: {
      texto:
        "La materia que nos rodea está en constante transformación: una vela arde, una manzana se oxida, el maíz crece con la luz del sol, un antiácido calma la acidez del estómago. En todos estos casos ocurre una REACCIÓN QUÍMICA: un proceso en el que una o más sustancias (los REACTIVOS) se transforman en otras sustancias nuevas y distintas (los PRODUCTOS). No es solo un cambio de aspecto: los átomos se reorganizan, se rompen y se forman enlaces, y nacen compuestos con propiedades diferentes. Entender la ESTRUCTURA de una reacción —cómo se escribe y qué significa cada parte— es la llave para comprender la química como el lenguaje de la transformación de la materia.\n\n" +
        "LA ECUACIÓN QUÍMICA. Para representar una reacción usamos una ECUACIÓN QUÍMICA, una especie de «oración» con su propia gramática. Se lee de izquierda a derecha: a la izquierda van los REACTIVOS, en medio una FLECHA (→) que se lee «se transforma en» o «produce», y a la derecha los PRODUCTOS. Por ejemplo, la combustión del gas de la estufa (metano) se escribe: CH₄ + 2 O₂ → CO₂ + 2 H₂O. Se lee: «una molécula de metano reacciona con dos de oxígeno para producir una de dióxido de carbono y dos de agua». El signo + separa las distintas sustancias de cada lado.\n\n" +
        "COEFICIENTES vs SUBÍNDICES: dos números que NO significan lo mismo. Esta es la confusión más común y la clave de toda la estructura. El SUBÍNDICE es el número pequeño abajo dentro de una fórmula: indica CUÁNTOS ÁTOMOS de ese elemento hay en UNA molécula. En H₂O el subíndice 2 dice que cada molécula de agua tiene 2 átomos de hidrógeno y 1 de oxígeno (cuando no hay subíndice, se entiende 1). El COEFICIENTE es el número grande delante de la fórmula: indica CUÁNTAS MOLÉCULAS (o moles) de esa sustancia participan. En 2 H₂O el coeficiente 2 dice que hay 2 moléculas de agua completas. La diferencia es enorme: cambiar un subíndice cambia la sustancia (H₂O es agua, H₂O₂ es agua oxigenada); cambiar un coeficiente solo cambia la cantidad. Los subíndices NO se tocan al balancear; solo se ajustan los coeficientes.\n\n" +
        "LA LEY DE LA CONSERVACIÓN DE LA MATERIA. En 1789 Antoine Lavoisier estableció que «en una reacción química la materia no se crea ni se destruye, solo se transforma». Esto significa que el número de átomos de cada elemento debe ser EL MISMO antes y después: lo que entra como reactivo tiene que salir como producto. Por eso una ecuación debe estar BALANCEADA. En CH₄ + 2 O₂ → CO₂ + 2 H₂O cuenta los átomos: a la izquierda hay 1 C, 4 H y 4 O (2 moléculas de O₂ × 2); a la derecha hay 1 C, 4 H (2 H₂O × 2) y 4 O (2 en CO₂ + 2 en las 2 H₂O). Todo cuadra: la ecuación está balanceada y respeta a Lavoisier. Contar átomos a ambos lados es la forma de comprobar que una ecuación es correcta.\n\n" +
        "LA SIMBOLOGÍA: pistas dentro de la ecuación. Además de fórmulas, flechas, coeficientes y subíndices, la ecuación usa SÍMBOLOS que dan información extra. Entre paréntesis se indica el ESTADO DE AGREGACIÓN: (s) sólido, (l) líquido, (g) gas y (ac) acuoso (disuelto en agua). Una flecha sencilla → marca una reacción que va en un solo sentido; una flecha DOBLE ⇌ indica una reacción REVERSIBLE, que ocurre en ambos sentidos a la vez, como la síntesis del amoniaco N₂ + 3 H₂ ⇌ 2 NH₃ (base de los fertilizantes). La letra griega Δ (delta) sobre la flecha indica que se necesita CALOR, y a veces las flechas ↑ y ↓ señalan un gas que se desprende o un sólido que precipita.\n\n" +
        "POR QUÉ IMPORTA, AQUÍ EN MÉXICO. Saber leer la estructura de una reacción explica fenómenos de todos los días. La combustión del gas LP en la estufa (CH₄/propano + O₂ → CO₂ + H₂O) libera la energía con que cocinamos. La FOTOSÍNTESIS del maíz y de las selvas (6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂) captura dióxido de carbono y produce el oxígeno que respiramos, conectando con el ciclo del carbono y el oxígeno de las esferas terrestres. La síntesis del AMONIACO sostiene la producción de fertilizantes para el campo mexicano. Y la NEUTRALIZACIÓN (HCl + NaOH → NaCl + H₂O) es la química de un antiácido calmando el estómago. En todas, la ecuación química es la herramienta que nos deja ver —y contar— cómo la materia se transforma sin perderse.",
      fuente: "MCCEMS 2025 — Ciencias Naturales, Experimentales y Tecnología III «Nuestro hogar. El sistema terrestre», contenido formativo: Concepto de reacción química · Estructura de una reacción química · Ecuación química como forma de representar una reacción · Simbología utilizada en fórmulas y reacciones químicas.",
      nivel_lectura: "intermedio",
      tiempo_estimado_minutos: 13,
      preguntas_comprension: [
        { pregunta: "¿Cuáles son las tres partes básicas de una ecuación química y cómo se ordenan?", respuesta_guia: "Reactivos a la izquierda, una flecha (→) en medio que se lee «se transforma en/produce», y productos a la derecha. El signo + separa las distintas sustancias de cada lado." },
        { pregunta: "¿Qué diferencia hay entre un coeficiente y un subíndice?", respuesta_guia: "El subíndice (número pequeño abajo, dentro de la fórmula) indica cuántos átomos de un elemento hay en una molécula (H₂O tiene 2 H); cambiarlo cambia la sustancia. El coeficiente (número grande delante de la fórmula) indica cuántas moléculas participan (2 H₂O son dos moléculas); cambiarlo solo cambia la cantidad. Al balancear solo se ajustan coeficientes, nunca subíndices." },
        { pregunta: "¿Cómo se comprueba que una ecuación respeta la ley de conservación de la materia de Lavoisier?", respuesta_guia: "Contando los átomos de cada elemento en ambos lados (coeficiente × subíndice): deben ser iguales antes y después, porque la materia no se crea ni se destruye, solo se transforma. Si todos los elementos coinciden, la ecuación está balanceada." },
      ],
    },
  },

  // ── A2 — EJERCICIO MATEMÁTICO (lleva el lab 3D) ───────────────────────────
  {
    titulo: "Cuenta los átomos: ¿está balanceada? (CH₄ + 2 O₂ → CO₂ + 2 H₂O)",
    descripcion: "Identifica reactivos y productos, distingue coeficientes de subíndices y cuenta los átomos de cada elemento para comprobar la conservación de la materia; verifícalo en el laboratorio 3D.",
    tipo: "ejercicio_matematico",
    xp: 15,
    estado: "borrador",
    contenido: {
      instrucciones: "Resuelve a mano y comprueba en el laboratorio 3D: en el modo «Anatomía» recorre reactivos, flecha, productos, coeficientes y subíndices; elige una reacción en la calculadora para ver el conteo de átomos lado a lado; usa el modo «Conservación» para verificar el balance y el modo «Simbología» para repasar los símbolos.",
      problema:
        "Trabaja con la combustión del metano (el gas de muchas estufas): CH₄ + 2 O₂ → CO₂ + 2 H₂O.\n\n" +
        "a) ESTRUCTURA. ¿Cuáles son los reactivos y cuáles los productos? ¿Qué indica la flecha →?\n\n" +
        "b) COEFICIENTES Y SUBÍNDICES. En «2 O₂», ¿qué significa el 2 grande de adelante (coeficiente) y qué significa el 2 pequeño de O₂ (subíndice)? ¿Cuántos átomos de oxígeno aporta «2 O₂» en total?\n\n" +
        "c) CONTEO DE ÁTOMOS. Cuenta los átomos de C, H y O en los reactivos y en los productos (multiplica coeficiente × subíndice).\n\n" +
        "d) CONSERVACIÓN. ¿La ecuación está balanceada? Justifica con la ley de conservación de la materia de Lavoisier.",
      contexto: "Los incisos recorren el contenido formativo: la estructura de la reacción y la ecuación química (a), la simbología de coeficientes y subíndices (b), y la ley de conservación de la materia comprobada átomo por átomo (c–d). En el laboratorio 3D el modo «Anatomía» señala cada parte de la ecuación, la calculadora cuenta los átomos de cada elemento a ambos lados y el modo «Conservación» dictamina si se conserva la materia.",
      tipo_respuesta: "desarrollo",
      pasos_guia: [
        "a) Reactivos (izquierda de la flecha): CH₄ y O₂. Productos (derecha): CO₂ y H₂O. La flecha → se lee «se transforma en / produce»: el metano y el oxígeno reaccionan para formar dióxido de carbono y agua.",
        "b) El coeficiente 2 (grande, delante) indica 2 moléculas de O₂. El subíndice 2 (pequeño, en O₂) indica 2 átomos de oxígeno por molécula. Total de átomos de O en «2 O₂» = 2 × 2 = 4 átomos de oxígeno.",
        "c) Reactivos: C = 1 (de CH₄); H = 4 (de CH₄); O = 2 × 2 = 4 (de 2 O₂). Productos: C = 1 (de CO₂); H = 2 × 2 = 4 (de 2 H₂O); O = 2 (de CO₂) + 2 × 1 (de 2 H₂O) = 4.",
        "d) Sí está balanceada: C 1=1, H 4=4, O 4=4. El número de átomos de cada elemento es el mismo antes y después, así que cumple la ley de conservación de la materia de Lavoisier: la materia no se crea ni se destruye, solo se transforma.",
      ],
      respuesta_final: "a) Reactivos CH₄ y O₂; productos CO₂ y H₂O; la flecha = «se transforma en». b) Coeficiente 2 = 2 moléculas de O₂; subíndice 2 = 2 átomos por molécula; «2 O₂» aporta 4 átomos de O. c) Reactivos C1 H4 O4 ; productos C1 H4 O4. d) Sí está balanceada (todos los elementos coinciden): cumple la ley de conservación de la materia.",
      unidades: "átomos por elemento (coeficiente × subíndice)",
      tolerancia_error: 0.01,
    },
  },

  // ── A3 — REFLEXIÓN ESCRITA ────────────────────────────────────────────────
  {
    titulo: "Una reacción química en tu casa",
    descripcion: "Reflexiona sobre una transformación química de tu entorno y escríbela como ecuación, identificando reactivos, productos y su simbología.",
    tipo: "reflexion_escrita",
    xp: 20,
    estado: "borrador",
    contenido: {
      prompt:
        "Elige una reacción química que ocurra en tu vida diaria —por ejemplo: el gas de la estufa ardiendo (combustión), un antiácido disolviéndose en agua, el hierro de una reja oxidándose, una fruta madurando, el pan o una bebida fermentando, o la fotosíntesis de una planta de tu casa— y descríbela. Identifica cuáles son los REACTIVOS (lo que se transforma) y cuáles los PRODUCTOS (lo nuevo que se forma); explica qué evidencia te dice que hubo una reacción (cambio de color, gas, calor, luz, olor); y si puedes, escríbela como ECUACIÓN con su flecha →, indicando coeficientes y subíndices y la simbología de estados (s/l/g/ac) que corresponda. Razona cómo se conserva la materia (los átomos no desaparecen) y di cómo lo comprobarías contando átomos en el laboratorio 3D.",
      pistas: [
        "Reactivos a la izquierda de la flecha, productos a la derecha; la flecha → se lee «se transforma en».",
        "Coeficiente = cuántas moléculas (número grande delante); subíndice = cuántos átomos por molécula (número pequeño dentro de la fórmula).",
        "Simbología de estados: (s) sólido, (l) líquido, (g) gas, (ac) acuoso. Flecha doble ⇌ = reacción reversible; Δ = se necesita calor.",
        "Ejemplo: combustión del gas, CH₄(g) + 2 O₂(g) → CO₂(g) + 2 H₂O(g); cuenta C, H y O a ambos lados para ver que se conserva la materia.",
      ],
      longitud_minima_palabras: 100,
      formato_esperado: "libre",
      criterios_evaluacion: [
        "Identifica una reacción química real y distingue reactivos de productos, con la evidencia de que ocurrió.",
        "Representa la transformación con la estructura de una ecuación (flecha, y de ser posible coeficientes, subíndices y simbología de estados).",
        "Explica cómo se conserva la materia y cómo lo comprobaría contando átomos en el laboratorio 3D.",
      ],
    },
  },

  // ── A4 — QUIZ VERDADERO / FALSO ───────────────────────────────────────────
  {
    titulo: "Verdadero o falso: estructura y simbología de las reacciones químicas",
    descripcion: "Pon a prueba lo que entendiste sobre reactivos, productos, coeficientes, subíndices, la flecha y la conservación de la materia.",
    tipo: "quiz_verdadero_falso",
    xp: 10,
    estado: "borrador",
    contenido: {
      preguntas: [
        { enunciado: "En una ecuación química, los reactivos se escriben a la izquierda de la flecha y los productos a la derecha.", respuesta: true, retroalimentacion: "Correcto: la flecha → se lee «se transforma en»; lo de la izquierda son los reactivos y lo de la derecha los productos." },
        { enunciado: "El subíndice de una fórmula indica cuántas moléculas de esa sustancia participan en la reacción.", respuesta: false, retroalimentacion: "Falso: el subíndice indica cuántos átomos de un elemento hay en una molécula (H₂O tiene 2 H). Las moléculas que participan las indica el coeficiente (el número grande de adelante)." },
        { enunciado: "Según la ley de conservación de la materia de Lavoisier, el número de átomos de cada elemento es igual antes y después de la reacción.", respuesta: true, retroalimentacion: "Correcto: la materia no se crea ni se destruye, solo se transforma; por eso la ecuación debe estar balanceada." },
        { enunciado: "Para balancear una ecuación se pueden cambiar libremente los subíndices de las fórmulas.", respuesta: false, retroalimentacion: "Falso: los subíndices NO se tocan (cambiarlos cambia la sustancia: H₂O es agua, H₂O₂ es agua oxigenada). Solo se ajustan los coeficientes." },
        { enunciado: "Una flecha doble ⇌ indica que la reacción es reversible, es decir, que ocurre en ambos sentidos.", respuesta: true, retroalimentacion: "Correcto: la ⇌ marca una reacción reversible, como N₂ + 3 H₂ ⇌ 2 NH₃ (síntesis del amoniaco)." },
        { enunciado: "Los símbolos (s), (l), (g) y (ac) en una ecuación indican el estado de agregación: sólido, líquido, gas y acuoso.", respuesta: true, retroalimentacion: "Correcto: esa simbología señala el estado físico de cada sustancia; (ac) significa disuelta en agua (acuosa)." },
      ],
    },
  },

  // ── A5 — GLOSARIO INTERACTIVO ─────────────────────────────────────────────
  {
    titulo: "Glosario: reacción, ecuación, coeficiente, subíndice y simbología química",
    descripcion: "Términos clave para leer y escribir la estructura de una reacción química.",
    tipo: "glosario_interactivo",
    xp: 15,
    estado: "borrador",
    contenido: {
      terminos: [
        { termino: "Reacción química", definicion: "Proceso en el que unas sustancias (reactivos) se transforman en otras nuevas (productos) reorganizando sus átomos.", ejemplo: "La combustión del gas de la estufa o la fotosíntesis de una planta." },
        { termino: "Reactivos", definicion: "Las sustancias que entran a la reacción; se escriben a la izquierda de la flecha.", ejemplo: "En CH₄ + 2 O₂ → CO₂ + 2 H₂O, los reactivos son CH₄ y O₂." },
        { termino: "Productos", definicion: "Las sustancias nuevas que se forman; se escriben a la derecha de la flecha.", ejemplo: "En la misma reacción, los productos son CO₂ y H₂O." },
        { termino: "Ecuación química", definicion: "Representación escrita de una reacción usando fórmulas, coeficientes, una flecha y simbología.", ejemplo: "2 H₂ + O₂ → 2 H₂O representa la formación del agua." },
        { termino: "Flecha de reacción (→)", definicion: "Símbolo que separa reactivos de productos y se lee «se transforma en» o «produce».", ejemplo: "Una flecha doble ⇌ indica que la reacción es reversible." },
        { termino: "Coeficiente", definicion: "Número grande delante de una fórmula; indica cuántas moléculas (o moles) de esa sustancia participan.", ejemplo: "En 2 H₂O el coeficiente 2 significa 2 moléculas de agua." },
        { termino: "Subíndice", definicion: "Número pequeño dentro de una fórmula; indica cuántos átomos de un elemento hay en una molécula (si no aparece, es 1).", ejemplo: "En H₂O el subíndice 2 dice que hay 2 átomos de hidrógeno." },
        { termino: "Ley de conservación de la materia", definicion: "Principio de Lavoisier: la materia no se crea ni se destruye, solo se transforma; los átomos de cada elemento se conservan.", ejemplo: "Por eso una ecuación debe estar balanceada (mismos átomos a ambos lados)." },
        { termino: "Ecuación balanceada", definicion: "Aquella en la que el número de átomos de cada elemento es igual en reactivos y productos.", ejemplo: "CH₄ + 2 O₂ → CO₂ + 2 H₂O: C 1=1, H 4=4, O 4=4." },
        { termino: "Reacción reversible", definicion: "Reacción que ocurre en ambos sentidos a la vez; se escribe con flecha doble ⇌.", ejemplo: "N₂ + 3 H₂ ⇌ 2 NH₃, la síntesis del amoniaco." },
        { termino: "Estado de agregación (s, l, g, ac)", definicion: "Simbología entre paréntesis que indica si una sustancia es sólida (s), líquida (l), gaseosa (g) o acuosa (ac, disuelta en agua).", ejemplo: "HCl(ac) + NaOH(ac) → NaCl(ac) + H₂O(l)." },
      ],
      actividad_final: "Toma la formación del agua 2 H₂ + O₂ → 2 H₂O: (1) di cuáles son reactivos y productos; (2) explica qué significan el coeficiente 2 y el subíndice 2; (3) cuenta los átomos de H y O a ambos lados y comprueba que se conserva la materia. Verifícalo en el laboratorio 3D.",
    },
  },

  // ── A6 — COMPLETAR ESPACIOS ───────────────────────────────────────────────
  {
    titulo: "Completa: las partes de una ecuación química",
    descripcion: "Completa el texto con los términos correctos sobre la estructura y la simbología de una reacción química.",
    tipo: "fill_blanks",
    xp: 10,
    estado: "borrador",
    contenido: {
      instrucciones: "Arrastra o escribe la palabra correcta en cada espacio.",
      texto_con_huecos:
        "En una reacción química, las sustancias que se transforman se llaman ___ y se escriben a la izquierda de la ___, que se lee «se transforma en». Las sustancias nuevas que se forman son los ___ y van a la derecha. El número grande delante de una fórmula es el ___, e indica cuántas moléculas participan; el número pequeño dentro de la fórmula es el ___, e indica cuántos ___ hay en una molécula. Según la ley de conservación de la materia de ___, el número de átomos de cada elemento debe ser ___ antes y después, por lo que la ecuación debe estar ___. La simbología (s), (l), (g) y (ac) indica el ___ de cada sustancia, y la flecha doble ⇌ señala una reacción ___.",
      huecos: [
        { posicion: 0, respuesta_correcta: "reactivos", alternativas_aceptadas: ["los reactivos"] },
        { posicion: 1, respuesta_correcta: "flecha", alternativas_aceptadas: ["flecha de reacción", "→"] },
        { posicion: 2, respuesta_correcta: "productos", alternativas_aceptadas: ["los productos"] },
        { posicion: 3, respuesta_correcta: "coeficiente", alternativas_aceptadas: ["coeficientes"] },
        { posicion: 4, respuesta_correcta: "subíndice", alternativas_aceptadas: ["subindice", "subíndices"] },
        { posicion: 5, respuesta_correcta: "átomos", alternativas_aceptadas: ["atomos"] },
        { posicion: 6, respuesta_correcta: "Lavoisier", alternativas_aceptadas: ["lavoisier"] },
        { posicion: 7, respuesta_correcta: "igual", alternativas_aceptadas: ["el mismo", "la misma"] },
        { posicion: 8, respuesta_correcta: "balanceada", alternativas_aceptadas: ["equilibrada"] },
        { posicion: 9, respuesta_correcta: "estado de agregación", alternativas_aceptadas: ["estado", "estado físico"] },
        { posicion: 10, respuesta_correcta: "reversible", alternativas_aceptadas: ["reversibles"] },
      ],
    },
  },

  // ── A7 — AUTOEVALUACIÓN ───────────────────────────────────────────────────
  {
    titulo: "¿Cómo voy con la estructura de una reacción química?",
    descripcion: "Evalúa tu propio dominio de los conceptos de esta progresión.",
    tipo: "autoevaluacion",
    xp: 10,
    estado: "borrador",
    contenido: {
      instrucciones: "Marca con honestidad qué tan seguro te sientes en cada punto. No hay respuestas correctas: te sirve para saber qué repasar.",
      criterios: [
        {
          descripcion: "Explico qué es una reacción química y distingo los reactivos de los productos en una ecuación.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Diferencio un coeficiente de un subíndice y sé qué indica cada uno.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Cuento los átomos de cada elemento a ambos lados y compruebo la conservación de la materia.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Interpreto la simbología de una ecuación (flecha →, flecha doble ⇌, estados s/l/g/ac, Δ).",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
      ],
      reflexion_final_prompt: "¿Qué parte de la estructura de una reacción te costó más entender (distinguir coeficiente de subíndice, contar átomos o la simbología) y cómo podrías repasarla con un ejemplo real de tu casa?",
    },
  },
];

async function recontarProgresiones(sb: SB, uacId: string): Promise<number> {
  const { count, error } = await sb
    .from("progresiones")
    .select("id", { count: "exact", head: true })
    .eq("uac_id", uacId);
  if (error) throw new Error(`Error contando progresiones: ${error.message}`);
  return count ?? 0;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const sb = createSB();

  console.log(`\n🌱 CNEYT-III·O4 — Estructura de una reacción química  (${apply ? "APLICAR" : "DRY-RUN"})\n`);

  // UAC
  const { data: uac, error: uacErr } = await sb.from("uac").select("id, total_progresiones").eq("codigo", UAC_CODIGO).single();
  if (uacErr || !uac) throw new Error(`UAC ${UAC_CODIGO} no encontrada: ${uacErr?.message}`);

  // ¿numero=4 libre? (no debe existir otra progresión con ese numero)
  const { data: choque } = await sb.from("progresiones").select("codigo").eq("uac_id", uac.id).eq("numero", PROG_NUMERO).maybeSingle();
  if (choque && choque.codigo !== PROG_CODIGO) {
    throw new Error(`numero=${PROG_NUMERO} ya está ocupado por ${choque.codigo} — abortado para no chocar.`);
  }

  // ¿codigo CNEYT-III-P09 libre? (no debe pisar otra progresión existente)
  const { data: choqueCod } = await sb.from("progresiones").select("numero").eq("codigo", PROG_CODIGO).maybeSingle();
  if (choqueCod && choqueCod.numero !== PROG_NUMERO) {
    throw new Error(`codigo ${PROG_CODIGO} ya existe con numero=${choqueCod.numero} — abortado para no pisar.`);
  }

  console.log(`Progresión ${PROG_CODIGO} (numero=${PROG_NUMERO}) — categoria "${PROGRESION.categoria}"`);
  console.log(`  titulo (O4 verbatim): ${PROGRESION.titulo}`);
  console.log(`Actividades (todas estado='borrador'):`);
  for (let i = 0; i < ACTIVIDADES.length; i++) {
    const a = ACTIVIDADES[i]!;
    const cod = `${PROG_CODIGO}-A${i + 1}`;
    const lab = a.tipo === "ejercicio_matematico" ? `  ← lab "${LAB_SLUG}"` : "";
    console.log(`  ${cod} | ${a.tipo} | xp${a.xp} | ${a.titulo}${lab}`);
  }

  if (!apply) {
    console.log("\n(DRY-RUN) No se escribió nada. Repite con --apply para aplicar.\n");
    return;
  }

  // 1) progresión
  const { error: pErr } = await sb.from("progresiones").upsert({
    codigo: PROGRESION.codigo,
    uac_id: uac.id,
    numero: PROGRESION.numero,
    titulo: PROGRESION.titulo,
    descripcion: PROGRESION.descripcion,
    meta_aprendizaje: PROGRESION.meta_aprendizaje,
    categoria: PROGRESION.categoria,
    subcategoria: PROGRESION.subcategoria,
    descripcion_extendida: PROGRESION.descripcion_extendida,
    ejes_articuladores: PROGRESION.ejes_articuladores,
    transversalidades: PROGRESION.transversalidades,
    tiempo_estimado_horas: PROGRESION.tiempo_estimado_horas,
    es_placeholder: false,
  }, { onConflict: "codigo" });
  if (pErr) throw new Error(`Error upsert progresión: ${pErr.message}`);
  console.log(`\n  ✓ progresión ${PROG_CODIGO}`);

  // id de la progresión recién upserteada
  const { data: prog, error: gErr } = await sb.from("progresiones").select("id").eq("codigo", PROG_CODIGO).single();
  if (gErr || !prog) throw new Error(`No se pudo releer la progresión: ${gErr?.message}`);

  // 2) actividades
  let ok = 0;
  for (let i = 0; i < ACTIVIDADES.length; i++) {
    const a = ACTIVIDADES[i]!;
    const exito = await upsertActividad(sb, {
      codigo: `${PROG_CODIGO}-A${i + 1}`,
      titulo: a.titulo,
      descripcion: a.descripcion,
      tipo: a.tipo,
      contenido: a.contenido,
      progresion_id: prog.id,
      xp: a.xp,
      estado: a.estado,
    });
    if (exito) ok++;
  }
  console.log(`\n  ${ok}/${ACTIVIDADES.length} actividades upserteadas`);
  if (ok !== ACTIVIDADES.length) throw new Error("Alguna actividad falló validación — revisa el log.");

  // 3) asociar el laboratorio a A2
  const A2 = `${PROG_CODIGO}-A2`;
  const { error: labErr } = await sb.from("actividades").update({ practica_slug: LAB_SLUG }).eq("codigo", A2);
  if (labErr) throw new Error(`Error asociando lab a ${A2}: ${labErr.message}`);
  console.log(`  ✓ lab "${LAB_SLUG}" asociado a ${A2}`);

  // 4) recontar total_progresiones
  const total = await recontarProgresiones(sb, uac.id);
  const { error: uErr } = await sb.from("uac").update({ total_progresiones: total }).eq("id", uac.id);
  if (uErr) throw new Error(`Error actualizando total_progresiones: ${uErr.message}`);
  console.log(`  ✓ uac.total_progresiones = ${total} (antes ${uac.total_progresiones})`);

  console.log(`\n✅ CNEYT-III·O4 sembrado (borrador). Ruta práctica:`);
  console.log(`   http://localhost:3000/hub/uac/${UAC_CODIGO}/progresion/${PROG_NUMERO}/actividad/2/practica\n`);
}

main().then(() => process.exit(0)).catch((e) => { console.error("❌", e.message); process.exit(1); });
