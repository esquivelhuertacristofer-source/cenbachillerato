/**
 * Producto Integrador del semestre para CNEYT-III
 * (Ciencias Naturales, Experimentales y Tecnología III — ecosistemas, sistema terrestre y ambiente).
 * - Crea 1 capstone (reflexion_escrita) que integra las 8 progresiones: biomas y ecosistemas,
 *   flujo de energía y redes tróficas, fotosíntesis, ciclos biogeoquímicos, subsistemas terrestres,
 *   deterioro ambiental, políticas de conservación y acciones locales fundamentadas en evidencia.
 *   Se aloja en la progresión de mayor número (culminante de CNEYT-III).
 * - Queda en estado 'borrador' (no publica nada): el usuario decide cuándo publicar CNEYT-III.
 * Uso: npx tsx scripts/seed-cneytiii-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador CNEYT-III (borrador)\n");

  const progs = await getProgresionesDeUAC(sb, "CNEYT-III");
  if (progs.length === 0) throw new Error("No se encontraron progresiones de CNEYT-III");
  const pFinal = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);

  const ok = await upsertActividad(sb, {
    codigo: "CNEYT-III-PRODUCTO-INTEGRADOR",
    progresion_id: pFinal.id,
    titulo: "Producto Integrador: Diagnóstico y Propuesta de Conservación de un Ecosistema Local",
    descripcion: "Capstone del semestre: integra biomas, redes tróficas, ciclos biogeoquímicos, subsistemas terrestres, deterioro ambiental y estrategias de conservación en un diagnóstico ambiental con propuesta de acción fundamentada en evidencia.",
    tipo: "reflexion_escrita",
    xp: 50,
    estado: "borrador",
    contenido: {
      prompt:
        "Producto Integrador del semestre de CNEYT-III. A lo largo del semestre estudiaste biomas y ecosistemas, flujo de energía y redes tróficas, fotosíntesis, ciclos biogeoquímicos (agua, carbono, nitrógeno y fósforo), los subsistemas terrestres (atmósfera, hidrosfera, litosfera y biosfera), el deterioro ambiental a distintas escalas, las políticas y estrategias de conservación en México y las acciones locales fundamentadas en evidencia.\n\nAhora vas a integrar todos esos aprendizajes en un ensayo de diagnóstico y propuesta de conservación de un ecosistema de tu región o comunidad.\n\nEscribe un ensayo de al menos 300 palabras que incluya las siguientes secciones:\n\n1) Descripción del ecosistema: Identifica el tipo de bioma al que pertenece tu ecosistema local, sus componentes bióticos (al menos 3 especies) y abióticos (clima, suelo, agua). Menciona el nivel de biodiversidad y si existen especies endémicas o en riesgo.\n\n2) Funcionamiento ecológico: Construye una red trófica simplificada del ecosistema con al menos 5 organismos, indicando productores, consumidores y descomponedores. Explica cómo fluye la energía aplicando la regla del 10 % y describe el papel de la fotosíntesis en el ecosistema.\n\n3) Ciclos biogeoquímicos: Explica cómo al menos dos ciclos biogeoquímicos (agua, carbono, nitrógeno o fósforo) funcionan en tu ecosistema y cómo son afectados por las perturbaciones actuales.\n\n4) Diagnóstico del deterioro ambiental: Identifica los principales problemas ambientales que enfrenta el ecosistema (contaminación, deforestación, cambio climático u otros). Clasifica cada problema según su escala: local, regional o global. Proporciona al menos un dato o evidencia que respalde tu diagnóstico.\n\n5) Propuesta de acción de conservación: Diseña una acción de conservación o restauración concreta, fundamentada en evidencia, que pueda implementarse en tu comunidad. Incluye: a) objetivo de la acción, b) metodología (qué se haría, con quiénes y con qué recursos), c) uso de especies nativas si aplica, d) al menos dos indicadores medibles para evaluar su éxito, y e) cómo esta acción local se relaciona con estrategias nacionales (ANP, LGEEPA, CONANP) o globales.\n\n6) Reflexión personal: Explica cómo la comprensión de los subsistemas terrestres y los ciclos biogeoquímicos fundamenta tu propuesta y qué aprendiste sobre la relación entre las acciones locales y los problemas ambientales de escala global.",
      pistas: [
        "Para la descripción del ecosistema, recuerda que los biomas se definen por el clima y la vegetación dominante; relaciona tu ecosistema con uno de los biomas estudiados (selva, bosque templado, matorral xerófilo, pastizal, manglar, etc.).",
        "En la red trófica, asegúrate de incluir al menos un productor, un consumidor primario, uno secundario y un descomponedor; aplica la regla del 10 % para explicar cuánta energía llega a cada nivel.",
        "Para los ciclos biogeoquímicos, piensa en cómo la deforestación, la contaminación o el uso de fertilizantes alteran el ciclo del carbono, del agua o del nitrógeno en tu ecosistema específico.",
        "En el diagnóstico, usa datos concretos si puedes: tasas de deforestación, niveles de contaminación de ríos o cifras de pérdida de biodiversidad en tu estado o municipio.",
        "Para la propuesta de conservación, recuerda que las acciones más exitosas usan especies nativas, involucran a la comunidad local (ciencia ciudadana) y tienen indicadores claros como porcentaje de cobertura vegetal recuperada o número de especies monitoreadas.",
      ],
      longitud_minima_palabras: 300,
      criterios_evaluacion: [
        "Identifica correctamente el bioma y los componentes bióticos y abióticos del ecosistema local elegido.",
        "Construye una red trófica coherente con productores, consumidores (primarios y secundarios) y descomponedores, explicando el flujo de energía.",
        "Explica el papel de la fotosíntesis en el ecosistema y lo vincula con el ciclo del carbono o el flujo de energía.",
        "Describe al menos dos ciclos biogeoquímicos presentes en el ecosistema y cómo son alterados por las perturbaciones humanas.",
        "Realiza un diagnóstico fundamentado en evidencia de los principales problemas ambientales del ecosistema, clasificándolos por escala.",
        "Propone una acción de conservación o restauración concreta, con metodología, uso de especies nativas e indicadores medibles de éxito.",
        "Relaciona la propuesta local con estrategias de conservación nacionales (ANP, LGEEPA, CONANP) o internacionales, y reflexiona sobre la conexión entre acciones locales y problemas globales.",
      ],
      formato_esperado: "ensayo",
    },
  });
  log(ok ? "  ✓ Producto Integrador CNEYT-III creado (borrador)\n" : "  ✗ Falló el Producto Integrador\n");

  // Estado actual de CNEYT-III (sin publicar)
  const ids = progs.map((p) => p.id);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 CNEYT-III total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
