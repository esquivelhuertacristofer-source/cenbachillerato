/**
 * Producto Integrador del semestre para PM-I (Pensamiento Matemático I — Pensamiento aritmético).
 * - Capstone (reflexion_escrita, formato ensayo) que integra el semestre: lógica, conteo y sistemas de
 *   numeración, conjuntos numéricos y operaciones, fracciones/porcentajes, potenciación/radicación,
 *   medición y notación científica, operaciones combinadas, razón/proporción y estimación.
 * - Se aloja en la progresión culminante (la de mayor numero).
 * - Queda en estado 'borrador' (no publica nada).
 * Uso: npx tsx scripts/seed-pmi-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador PM-I (borrador)\n");

  const progs = await getProgresionesDeUAC(sb, "PM-I");
  const culminante = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);
  if (!culminante) throw new Error("No se encontró la progresión culminante de PM-I");

  const ok = await upsertActividad(sb, {
    codigo: "PM-I-PRODUCTO-INTEGRADOR",
    progresion_id: culminante.id,
    titulo: "Producto Integrador: las matemáticas en un problema de mi vida",
    descripcion: "Capstone del semestre: resuelve y explica un problema real de tu entorno usando la aritmética y el pensamiento lógico aprendidos.",
    tipo: "reflexion_escrita",
    xp: 50,
    estado: "borrador",
    contenido: {
      prompt:
        "Producto Integrador del semestre. A lo largo de Pensamiento Matemático I aprendiste a usar las matemáticas como una herramienta para pensar y resolver problemas: la lógica (proposiciones y conectivos), el conteo y los sistemas de numeración (incluido el valor del cero), los conjuntos numéricos y sus operaciones y propiedades, la factorización, el MCD y el mcm, las fracciones y los porcentajes, la potenciación y la radicación, la medición con el Sistema Internacional y la notación científica, las operaciones combinadas con su jerarquía, la razón y la proporción, y la estimación para verificar resultados.\n\nAhora vas a integrarlo eligiendo UN problema real de tu vida o tu entorno que se pueda resolver con matemáticas. Algunos ejemplos: calcular el costo total de una compra con descuentos (porcentajes), repartir un gasto entre varias personas (fracciones y proporción), ajustar una receta para más personas (regla de tres), planear un presupuesto o un ahorro, comparar precios por cantidad, o estimar cuánto material necesitas para un proyecto.\n\nEscribe un texto de entre 250 y 600 palabras que:\n\n1) DESCRIBE el problema y dónde aparece en tu vida.\n2) PLANTEA los datos y QUÉ operaciones necesitas (fracciones, porcentajes, regla de tres, operaciones combinadas, potencias, etc.). Usa al menos tres herramientas distintas del semestre.\n3) RESUELVE mostrando el procedimiento y respetando la jerarquía de operaciones. Incluye al menos un cálculo con porcentaje o proporción.\n4) ESTIMA primero un resultado aproximado y luego compáralo con tu resultado exacto para verificar que sea razonable.\n5) Cierra explicando qué decisión tomarías con base en tu resultado y qué aprendiste sobre cómo las matemáticas ayudan a pensar.",
      pistas: [
        "Elige un problema que de verdad te interese resolver: tendrás datos concretos.",
        "Usa al menos tres herramientas distintas (por ejemplo: porcentaje, regla de tres y operaciones combinadas).",
        "Respeta la jerarquía: paréntesis, potencias/raíces, multiplicación/división, suma/resta.",
        "Estima primero 'a ojo' y luego compara con el cálculo exacto para verificar que sea razonable.",
        "Muestra el procedimiento, no solo el resultado final.",
      ],
      longitud_minima_palabras: 250,
      longitud_maxima_palabras: 600,
      criterios_evaluacion: [
        "Describe un problema concreto de su entorno que se resuelve con matemáticas.",
        "Identifica los datos y las operaciones necesarias usando al menos tres herramientas del semestre.",
        "Resuelve mostrando el procedimiento y respetando la jerarquía de operaciones.",
        "Incluye al menos un cálculo con porcentaje o proporción correctamente resuelto.",
        "Estima un resultado aproximado y verifica que el resultado exacto sea razonable.",
        "Explica la decisión que tomaría y reflexiona sobre la utilidad de las matemáticas; redacción clara.",
      ],
      formato_esperado: "ensayo",
    },
  });
  log(ok ? `  ✓ Producto Integrador PM-I creado (borrador) en progresión numero ${culminante.numero}\n` : "  ✗ Falló el Producto Integrador\n");

  const ids = progs.map((p) => p.id);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 PM-I total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
