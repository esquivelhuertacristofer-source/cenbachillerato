/**
 * Producto Integrador del semestre para CD-III (Cultura Digital III —
 * comunicación digital multimodal, producción con perspectiva de género,
 * vocaciones digitales y participación comunitaria mediada por tecnología).
 * - Crea 1 capstone (reflexion_escrita) que integra las 4 progresiones:
 *   (1) Comunicación digital multimodal e identidades sociales,
 *   (2) Producción de contenidos con perspectiva de género e inclusión,
 *   (3) Vocaciones y trayectorias profesionales en tecnologías digitales,
 *   (4) Proyecto de participación comunitaria mediado por tecnologías digitales.
 *   Se aloja en la progresión de mayor número (culminante de CD-III).
 * - Queda en estado 'borrador' (no publica nada): el usuario decide cuándo publicar.
 * Uso: npx tsx scripts/seed-cdiii-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador CD-III (borrador)\n");

  const progs = await getProgresionesDeUAC(sb, "CD-III");
  if (progs.length === 0) throw new Error("No se encontraron progresiones de CD-III");
  const pFinal = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);

  const ok = await upsertActividad(sb, {
    codigo: "CD-III-PRODUCTO-INTEGRADOR",
    progresion_id: pFinal.id,
    titulo: "Producto Integrador: Proyecto Digital Comunitario — Comunicación, Género, Vocación y Participación",
    descripcion: "Capstone del semestre: integra las cuatro progresiones de CD-III (comunicación digital multimodal crítica, producción de contenidos con perspectiva de género e inclusión, exploración de vocaciones digitales y diseño de proyecto de participación comunitaria mediado por tecnología) en un proyecto digital comunitario documentado.",
    tipo: "reflexion_escrita",
    xp: 50,
    contenido: {
      prompt:
        "PRODUCTO INTEGRADOR — CD-III: Cultura Digital III\n\n" +
        "A lo largo del semestre desarrollaste cuatro competencias de ciudadanía y cultura digital: " +
        "(1) el análisis crítico de la comunicación digital multimodal y sus efectos en la construcción de identidades y realidades sociales; " +
        "(2) la producción de contenidos digitales de calidad orientados a la transformación social con perspectiva de género e inclusión; " +
        "(3) la exploración de vocaciones y trayectorias profesionales vinculadas a las tecnologías digitales con perspectiva de género; y " +
        "(4) el diseño de un proyecto de participación comunitaria mediado por tecnologías digitales.\n\n" +
        "SITUACIÓN INTEGRADORA — PROYECTO DIGITAL COMUNITARIO:\n" +
        "Tu tarea es diseñar y documentar un Proyecto Digital Comunitario (PDC) que integre las cuatro competencias desarrolladas. " +
        "El proyecto debe responder a una necesidad, problema o oportunidad real de tu comunidad (escolar, barrial, familiar o local) " +
        "usando herramientas y plataformas digitales como medio de acción y comunicación. " +
        "No es necesario implementar el proyecto por completo; sí es necesario diseñarlo con suficiente detalle y reflexión crítica.\n\n" +
        "Tu documento (mínimo 300 palabras) debe desarrollar CADA UNO de los siguientes cuatro apartados:\n\n" +
        "1) ANÁLISIS CRÍTICO DE LA COMUNICACIÓN DIGITAL EN TU CONTEXTO COMUNITARIO:\n" +
        "Describe el panorama comunicativo digital de la comunidad a la que va dirigido tu proyecto. " +
        "¿Qué plataformas o medios digitales usan sus miembros (WhatsApp, Facebook, Instagram, TikTok, YouTube, etc.)? " +
        "¿Qué tipos de mensajes circulan: texto, imagen, video, audio? Identifica al menos un mensaje o narrativa digital " +
        "que haya influido en la percepción de un problema o grupo social dentro de esa comunidad. " +
        "Analiza críticamente ese mensaje: ¿quién lo produce?, ¿qué modos semióticos usa?, ¿qué identidad o imagen " +
        "construye sobre algún grupo social?, ¿qué sesgos o efectos puede tener en la realidad de las personas? " +
        "Este análisis te ayudará a entender el entorno comunicativo en el que actuará tu proyecto.\n\n" +
        "2) ESTRATEGIA DE CONTENIDOS CON PERSPECTIVA DE GÉNERO E INCLUSIÓN:\n" +
        "Diseña la estrategia de comunicación y producción de contenidos de tu proyecto. " +
        "Especifica: (a) el problema o necesidad comunitaria que aborda, (b) los formatos de contenido que producirás " +
        "(por ejemplo: videos cortos, infografías, publicaciones en redes, podcasts, boletines digitales, historias de Instagram), " +
        "(c) cómo incorporarás perspectiva de género en los mensajes (¿qué estereotipos evitarás?, ¿qué voces visibilizarás?), " +
        "(d) qué criterios de accesibilidad incluirás (lenguaje claro, subtítulos, contraste visual, formatos alternativos) " +
        "para llegar a la mayor diversidad posible de personas en tu comunidad. " +
        "Explica por qué la perspectiva de género e inclusión es relevante para el problema que estás abordando.\n\n" +
        "3) REFLEXIÓN SOBRE VOCACIONES DIGITALES IMPLICADAS EN EL PROYECTO:\n" +
        "Identifica qué perfiles profesionales del sector digital serían necesarios para implementar tu proyecto de manera " +
        "completa y profesional. Por ejemplo: ¿necesitarías diseñadores UX/UI para la interfaz?, ¿creadores de contenido?, " +
        "¿personas con conocimientos en ciencia de datos para medir el impacto?, ¿especialistas en ciberseguridad para " +
        "proteger los datos de la comunidad? Elige uno de esos perfiles que te resulte más interesante en relación con " +
        "tus propias habilidades e intereses. Reflexiona sobre: ¿qué te atrae de ese perfil?, ¿qué habilidades ya tienes " +
        "que se relacionan con él?, ¿qué te faltaría aprender?, ¿existen barreras de género u otras barreras para " +
        "personas como tú en ese campo? ¿Cómo podría este proyecto ser un primer paso en esa trayectoria vocacional?\n\n" +
        "4) DISEÑO DEL PROYECTO DE PARTICIPACIÓN COMUNITARIA:\n" +
        "Presenta el diseño completo de tu Proyecto Digital Comunitario con los siguientes elementos: " +
        "(a) DIAGNÓSTICO: ¿cuál es el problema o necesidad identificado?, ¿quiénes son los afectados?, " +
        "¿cuáles son las causas?, ¿qué recursos digitales ya existen en la comunidad?; " +
        "(b) PROPUESTA: ¿qué solución digital propones?, ¿qué herramientas o plataformas usarás y por qué son pertinentes " +
        "para el contexto de conectividad y dispositivos de tu comunidad?; " +
        "(c) ESTRATEGIA DE PARTICIPACIÓN: ¿cómo involucrarás a los miembros de la comunidad como co-diseñadores o " +
        "co-implementadores, no solo como receptores?; " +
        "(d) PLAN DE IMPLEMENTACIÓN: describe las etapas del proyecto (diagnóstico, diseño, piloto, evaluación) " +
        "con al menos tres acciones concretas para cada una; " +
        "(e) EVALUACIÓN E IMPACTO: propón al menos tres indicadores que usarías para medir el éxito del proyecto " +
        "(uno cuantitativo, uno cualitativo y uno de equidad de género o inclusión); " +
        "(f) SOSTENIBILIDAD: ¿cómo garantizarías que el proyecto continúe generando impacto después de que concluya " +
        "el semestre o tu participación directa en él?\n\n" +
        "CIERRE Y REFLEXIÓN INTEGRADORA:\n" +
        "Finaliza tu documento con una reflexión personal que responda: ¿Cómo las cuatro competencias de CD-III " +
        "(análisis crítico de comunicación digital, producción con perspectiva de género, exploración vocacional y " +
        "diseño de proyecto comunitario) se articulan en tu PDC? ¿Qué aprendiste sobre el papel de la tecnología " +
        "como herramienta de transformación social? ¿Qué limitaciones encontraste en tu proyecto y qué harías " +
        "diferente con más tiempo o recursos? ¿Qué responsabilidades éticas tiene quien usa tecnología digital " +
        "para intervenir en una comunidad?\n\n" +
        "Escribe con claridad, sé honesto/a en tu reflexión y muestra evidencia de pensamiento crítico en cada apartado. " +
        "Recuerda que la calidad de un proyecto no se mide por su complejidad tecnológica, sino por su pertinencia, " +
        "su enfoque participativo y su potencial de transformación en la comunidad.",
      pistas: [
        "Para el ANÁLISIS CRÍTICO (apartado 1): no necesitas analizar un mensaje complicado. Un meme, una publicación viral o un grupo de WhatsApp de tu barrio son suficientes para el análisis. Usa las preguntas: ¿quién lo produce?, ¿qué muestra y qué oculta?, ¿qué imagen construye de algún grupo (mujeres, jóvenes, migrantes, etc.)?, ¿qué emociones busca provocar?",
        "Para la ESTRATEGIA DE CONTENIDOS (apartado 2): piensa en formatos que ya conoces y puedes usar: una historia de Instagram, un video corto en TikTok, un grupo de WhatsApp, una publicación en Facebook, un cartel digital. No es necesario usar herramientas avanzadas. Lo importante es que el formato sea adecuado para tu audiencia y que incorpores perspectiva de género e inclusión de manera genuina, no decorativa.",
        "Para la REFLEXIÓN VOCACIONAL (apartado 3): si no sabes con certeza qué carrera digital te interesa, está bien. Esta es una exploración. Describe lo que SÍ sabes: ¿qué partes del proyecto disfrutaste más (comunicar, organizar, diseñar, analizar)? Esas preferencias son pistas sobre tu vocación. Menciona también barreras reales que existen para personas de tu género en ese campo y cómo podrían superarse.",
        "Para el DISEÑO DEL PROYECTO (apartado 4): el proyecto no tiene que ser perfectamente ejecutable en este semestre. Lo importante es que sea realista para tu contexto, que responda a una necesidad real y que muestre que pensaste en la participación de la comunidad, la sostenibilidad y la equidad. Evita proyectos que impongan tecnología sin considerar si la comunidad puede o quiere usarla.",
        "Para la REFLEXIÓN FINAL: la pregunta sobre responsabilidades éticas es clave. Piensa en temas como: privacidad de los datos de la comunidad, consentimiento informado, quién se beneficia y quién podría ser excluido, cómo se maneja la información sensible, y cómo se distribuye el crédito y la autoría del proyecto entre todos los participantes.",
      ],
      longitud_minima_palabras: 300,
      criterios_evaluacion: [
        "Analiza críticamente al menos un mensaje digital del contexto comunitario identificando sus modos semióticos, la identidad o narrativa que construye sobre algún grupo social y sus posibles efectos en la percepción de la realidad.",
        "Diseña una estrategia de contenidos digitales con perspectiva de género e inclusión explícitas: especifica formatos, audiencia, al menos dos criterios de accesibilidad y justifica cómo el contenido aborda el problema comunitario sin reproducir estereotipos.",
        "Reflexiona sobre vocaciones digitales implicadas en el proyecto: identifica al menos dos perfiles profesionales TIC necesarios, elige uno con el que se identifica, y analiza barreras de género u otras barreras de acceso a ese campo.",
        "Presenta un diseño completo del Proyecto Digital Comunitario con diagnóstico fundamentado, propuesta pertinente al contexto, estrategia de participación, plan de implementación por etapas, tres indicadores de evaluación (cuantitativo, cualitativo y de equidad) y reflexión sobre sostenibilidad.",
      ],
      formato_esperado: "libre",
    },
  });
  log(ok ? "  ✓ Producto Integrador CD-III creado (borrador)\n" : "  ✗ Falló el Producto Integrador\n");

  // Estado actual de CD-III (sin publicar)
  const ids = progs.map((p) => p.id);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 CD-III total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
