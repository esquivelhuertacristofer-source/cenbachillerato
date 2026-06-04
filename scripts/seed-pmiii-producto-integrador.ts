/**
 * Producto Integrador del semestre para PM-III (Pensamiento Matemático III —
 * álgebra y geometría plana, ecuaciones de segundo grado).
 * - Crea 1 capstone (reflexion_escrita) que integra las 6 progresiones:
 *   Pitágoras, ecuaciones cuadráticas, discriminante, medición (perímetros/áreas/
 *   volúmenes), semejanza/congruencia y relación álgebra-geometría (parábolas).
 *   Se aloja en la progresión de mayor número (culminante de PM-III).
 * - Queda en estado 'borrador' (no publica nada): el usuario decide cuándo publicar PM-III.
 * Uso: npx tsx scripts/seed-pmiii-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador PM-III (borrador)\n");

  const progs = await getProgresionesDeUAC(sb, "PM-III");
  if (progs.length === 0) throw new Error("No se encontraron progresiones de PM-III");
  const pFinal = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);

  const ok = await upsertActividad(sb, {
    codigo: "PM-III-PRODUCTO-INTEGRADOR",
    progresion_id: pFinal.id,
    titulo: "Producto Integrador: Matemáticas en el Mundo Real — Diseño, Construcción y Análisis",
    descripcion: "Capstone del semestre: integra el Teorema de Pitágoras, la resolución y análisis de una ecuación cuadrática (discriminante y parábola) y el cálculo de área y volumen de una figura geométrica, aplicados a una situación real de diseño o construcción.",
    tipo: "reflexion_escrita",
    xp: 50,
    estado: "borrador",
    contenido: {
      prompt:
        "Producto Integrador — PM-III: Pensamiento Matemático III.\n\n" +
        "A lo largo del semestre estudiaste el Teorema de Pitágoras y sus aplicaciones, los métodos para resolver ecuaciones de segundo grado (factorización, fórmula general y completar el cuadrado), el discriminante y la naturaleza de las raíces, el cálculo de perímetros, áreas y volúmenes de figuras geométricas, los criterios de semejanza y congruencia de triángulos, y la relación entre álgebra y geometría a través de la gráfica de funciones cuadráticas (parábolas).\n\n" +
        "SITUACIÓN INTEGRADORA:\n" +
        "Imagina que formas parte de un equipo de diseño o construcción (puedes elegir: diseño de un parque, una rampa de acceso, una piscina, un invernadero, una cancha deportiva, una casa, un puente, etc.). Tu tarea es elaborar un informe técnico-matemático que demuestre cómo se usan las matemáticas de PM-III en ese proyecto real.\n\n" +
        "Tu informe (mínimo 300 palabras) debe incluir:\n\n" +
        "1) PITÁGORAS: Identifica un triángulo rectángulo dentro de tu proyecto (por ejemplo, una diagonal, una rampa, una estructura triangular). Aplica el Teorema de Pitágoras para calcular una medida desconocida. Muestra el procedimiento completo: a² + b² = c².\n\n" +
        "2) ECUACIÓN CUADRÁTICA: Plantea una ecuación de segundo grado que surja naturalmente de tu proyecto (por ejemplo, calcular una dimensión a partir de un área conocida, optimizar un espacio, etc.). Resuélvela por al menos uno de los métodos vistos (factorización, fórmula general o completar el cuadrado). Muestra cada paso.\n\n" +
        "3) DISCRIMINANTE Y PARÁBOLA: Calcula el discriminante de tu ecuación cuadrática e interpreta su significado en el contexto de tu proyecto. ¿Cuántas soluciones reales tiene? ¿Cuál o cuáles tienen sentido en el contexto (por ejemplo, una longitud no puede ser negativa)? Si tu situación lo permite, describe o esboza la parábola asociada: indica su vértice, eje de simetría y ceros.\n\n" +
        "4) ÁREA Y/O VOLUMEN: Calcula el área de al menos una figura plana y el volumen de al menos un cuerpo geométrico presentes en tu proyecto. Indica las fórmulas utilizadas y el proceso de cálculo con las unidades correctas.\n\n" +
        "5) REFLEXIÓN: Al final del informe, responde en español: ¿Qué aprendizajes de PM-III fueron más útiles para tu proyecto? ¿Cuál fue el mayor reto matemático y cómo lo resolviste?\n\n" +
        "Escribe con claridad, muestra todos los procedimientos matemáticos paso a paso y justifica cada decisión. Puedes incluir diagramas o esquemas a mano que luego describas con palabras.",
      pistas: [
        "Para el Teorema de Pitágoras, identifica primero cuál es la hipotenusa (el lado más largo, opuesto al ángulo recto) y cuáles son los catetos. Luego despeja la incógnita: si buscas un cateto, usa a = √(c²−b²).",
        "Para plantear tu ecuación cuadrática, piensa en situaciones donde el área de una figura depende de una longitud desconocida x. Por ejemplo: si el largo de un rectángulo es (x+3) m y el ancho es x m, y el área es 40 m², entonces x(x+3) = 40 → x²+3x−40 = 0.",
        "Recuerda que el discriminante Δ = b²−4ac te dice cuántas soluciones reales hay antes de resolver. En problemas de construcción, si obtienes dos raíces reales, elige la que tenga sentido físico (positiva, dentro de rango razonable).",
        "Para la parábola, usa x_v = −b/(2a) para encontrar el vértice y luego evalúa f(x_v) para obtener la ordenada. Los ceros son las raíces de la ecuación y representan las intersecciones con el eje x.",
        "Para el volumen de cuerpos sólidos, recuerda: prismas y cilindros usan V = A_base × h; pirámides y conos usan V = (1/3) × A_base × h; esfera usa V = (4/3)πr³. Verifica siempre las unidades (cm³, m³).",
      ],
      longitud_minima_palabras: 300,
      criterios_evaluacion: [
        "Aplica correctamente el Teorema de Pitágoras para calcular una medida dentro de su proyecto, mostrando el procedimiento completo (a²+b²=c²).",
        "Plantea una ecuación cuadrática relevante al contexto real elegido y la resuelve por al menos un método (factorización, fórmula general o completar el cuadrado), con todos los pasos visibles.",
        "Calcula e interpreta el discriminante de su ecuación cuadrática, identifica la naturaleza de las raíces y selecciona la solución con sentido en el contexto del proyecto.",
        "Describe o esboza la parábola asociada a su función cuadrática, identificando vértice, eje de simetría y ceros (raíces) correctamente.",
        "Calcula el área de al menos una figura plana del proyecto usando la fórmula adecuada con unidades correctas.",
        "Calcula el volumen de al menos un cuerpo geométrico del proyecto usando la fórmula adecuada con unidades correctas.",
        "Redacta una reflexión que conecta los aprendizajes de PM-III con la situación real, identifica el mayor reto matemático del proyecto y describe cómo lo superó.",
      ],
      formato_esperado: "ensayo",
    },
  });
  log(ok ? "  ✓ Producto Integrador PM-III creado (borrador)\n" : "  ✗ Falló el Producto Integrador\n");

  // Estado actual de PM-III (sin publicar)
  const ids = progs.map((p) => p.id);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 PM-III total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
