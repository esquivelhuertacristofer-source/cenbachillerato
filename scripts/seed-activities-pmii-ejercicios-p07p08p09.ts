/**
 * Cierre de gap PM-II: agrega un `ejercicio_matematico` (A8) a las 3 progresiones
 * oficiales que NO tenían ejercicio de cálculo (solo A1-A7 conceptuales):
 *   · PM-II-P07 (oficial 3) — Operaciones con monomios y binomios
 *   · PM-II-P08 (oficial 4) — Operaciones con trinomios y polinomios; productos notables
 *   · PM-II-P09 (oficial 6) — Ecuación, igualdad y sus propiedades
 *
 * Alcance verificado contra fuentes oficiales del proyecto:
 *   · docs/programas-oficiales/extraidos/05-PENSAMIENTO-MATEMATICO.md (temario MCCEMS 2025)
 *   · scripts/seed-pmii-realineacion-progresiones.ts (descripcion_extendida oficial de cada progresión)
 *   · scripts/seed-planteamiento/data/pm-ii.json (contextos/redacción ya alineados al MCCEMS)
 *
 * Todas en estado='borrador' (el usuario revisa y publica). xp 15.
 * Uso: npx tsx scripts/seed-activities-pmii-ejercicios-p07p08p09.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad, type ActividadInput } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

type Ejercicio = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido">;

const ejercicios: Record<string, Ejercicio> = {
  // ════════ PM-II-P07 — Operaciones con monomios y binomios ════════
  // Oficial: suma, resta, multiplicación y división; reglas de los exponentes y de los signos.
  "PM-II-P07": {
    titulo: "Ejercicio — Operaciones con monomios y binomios",
    descripcion: "Aplica la suma de términos semejantes, la multiplicación de monomio por binomio y las reglas de los exponentes en un contexto real.",
    tipo: "ejercicio_matematico",
    xp: 15,
    contenido: {
      instrucciones: "Realiza cada operación reduciendo el resultado a su forma más simple.",
      problema:
        "Un huerto escolar rectangular mide (2x + 3) metros de largo y 4x metros de ancho. Resuelve:\n" +
        "(a) Suma los dos lados largos: (2x + 3) + (2x + 3).\n" +
        "(b) Calcula el área multiplicando largo por ancho: 4x · (2x + 3).\n" +
        "(c) Reduce los términos semejantes: 5x² + 3x² − 2x².",
      contexto:
        "Para operar con monomios y binomios solo se suman o restan los términos semejantes (misma parte literal), y al multiplicar se aplican las reglas de los signos y de los exponentes: al multiplicar potencias de la misma base se suman los exponentes (x · x = x²).",
      tipo_respuesta: "algebraica",
      pasos_guia: [
        "(a) Suma los términos semejantes: 2x + 2x = 4x y 3 + 3 = 6, así que el resultado es 4x + 6.",
        "(b) Multiplica el monomio por cada término del binomio: 4x · 2x = 8x² (4·2 y x·x) y 4x · 3 = 12x; el área es 8x² + 12x.",
        "(c) Todos son términos semejantes en x²: 5 + 3 − 2 = 6, así que 5x² + 3x² − 2x² = 6x².",
      ],
      respuesta_final: "(a) 4x + 6; (b) 8x² + 12x; (c) 6x²",
      unidades: "",
      tolerancia_error: 0,
      imagen_problema: "",
    },
  },

  // ════════ PM-II-P08 — Operaciones con trinomios y polinomios; productos notables ════════
  // Oficial: suma/resta/mult/div de polinomios; productos notables (binomio al cuadrado, conjugados, etc.).
  "PM-II-P08": {
    titulo: "Ejercicio — Productos notables y operaciones con polinomios",
    descripcion: "Desarrolla un binomio al cuadrado, multiplica binomios conjugados y suma polinomios reduciendo términos semejantes.",
    tipo: "ejercicio_matematico",
    xp: 15,
    contenido: {
      instrucciones: "Desarrolla cada expresión aplicando los productos notables y la suma de polinomios.",
      problema:
        "Una plaza cuadrada de la comunidad mide (x + 5) metros por lado. Resuelve:\n" +
        "(a) Área de la plaza, desarrollando el binomio al cuadrado: (x + 5)².\n" +
        "(b) Producto de binomios conjugados: (x + 5)(x − 5).\n" +
        "(c) Suma los polinomios: (x² + 2x − 1) + (3x² − x + 4).",
      contexto:
        "Los productos notables permiten desarrollar productos sin multiplicar término a término: el binomio al cuadrado (a + b)² = a² + 2ab + b², y los binomios conjugados (a + b)(a − b) = a² − b². Al sumar polinomios se agrupan los términos semejantes.",
      tipo_respuesta: "algebraica",
      pasos_guia: [
        "(a) (x + 5)² = x² + 2·(x)·(5) + 5² = x² + 10x + 25.",
        "(b) Conjugados: (x + 5)(x − 5) = x² − 5² = x² − 25 (el término del medio se cancela).",
        "(c) Agrupa semejantes: x² + 3x² = 4x²; 2x − x = x; −1 + 4 = 3, así que el resultado es 4x² + x + 3.",
      ],
      respuesta_final: "(a) x² + 10x + 25; (b) x² − 25; (c) 4x² + x + 3",
      unidades: "",
      tolerancia_error: 0,
      imagen_problema: "",
    },
  },

  // ════════ PM-II-P09 — Ecuación, igualdad y sus propiedades ════════
  // Oficial: concepto de ecuación e igualdad; identidad algebraica; propiedades de la igualdad (uniformidad…).
  "PM-II-P09": {
    titulo: "Ejercicio — Propiedades de la igualdad: identidad y ecuación",
    descripcion: "Aplica la propiedad de uniformidad de la igualdad, comprueba la solución y distingue una identidad de una ecuación.",
    tipo: "ejercicio_matematico",
    xp: 15,
    contenido: {
      instrucciones: "Resuelve cada inciso justificando la propiedad de la igualdad que utilizas.",
      problema:
        "Imagina una balanza en equilibrio: lo que se hace de un lado debe hacerse del otro para mantener la igualdad. Resuelve:\n" +
        "(a) Usa la propiedad de uniformidad para hallar x en x + 7 = 12 (¿qué operación aplicas en ambos lados?).\n" +
        "(b) Comprueba tu resultado sustituyendo el valor de x en la igualdad original.\n" +
        "(c) Indica cuál de estas igualdades es una IDENTIDAD (se cumple para cualquier valor) y cuál es una ECUACIÓN (se cumple solo para ciertos valores): 2(x + 3) = 2x + 6  y  x + 4 = 9.",
      contexto:
        "Una igualdad se conserva si se aplica la misma operación en ambos lados (propiedad de uniformidad). Una identidad es verdadera para cualquier valor de la variable; una ecuación solo es verdadera para valores específicos (sus soluciones).",
      tipo_respuesta: "desarrollo",
      pasos_guia: [
        "(a) Resta 7 en ambos lados (propiedad de uniformidad): x + 7 − 7 = 12 − 7, entonces x = 5.",
        "(b) Sustituye x = 5 en x + 7 = 12: 5 + 7 = 12, que es verdadero, así que la solución es correcta.",
        "(c) Desarrolla 2(x + 3) = 2x + 6: ambos lados son iguales para cualquier x, es una IDENTIDAD. En cambio x + 4 = 9 solo se cumple si x = 5, es una ECUACIÓN.",
      ],
      respuesta_final:
        "(a) x = 5 (restando 7 a ambos lados, propiedad de uniformidad); (b) 5 + 7 = 12, verdadero; (c) 2(x + 3) = 2x + 6 es IDENTIDAD y x + 4 = 9 es ECUACIÓN",
      unidades: "",
      tolerancia_error: 0,
      imagen_problema: "",
    },
  },
};

async function main() {
  const sb = createSB();
  log("\n🌱 PM-II — ejercicio_matematico (A8) para P07, P08 y P09 [borrador]\n");
  const progs = await getProgresionesDeUAC(sb, "PM-II");
  let ok = 0, fail = 0, skip = 0;
  for (const p of progs) {
    const e = ejercicios[p.codigo];
    if (!e) { skip++; continue; }
    const res = await upsertActividad(sb, {
      codigo: `${p.codigo}-A8`, titulo: e.titulo, descripcion: e.descripcion,
      tipo: e.tipo, progresion_id: p.id, xp: e.xp, contenido: e.contenido,
    });
    if (res) { ok++; log(`  ✓ ${p.codigo}-A8 — ${e.titulo}`); } else { fail++; log(`  ✗ ${p.codigo}-A8`); }
  }
  log(`\n✅ PM-II ejercicios: ${ok} insertadas, ${fail} fallidas, ${skip} progresiones omitidas (no requieren).\n`);
}

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
