/**
 * Seed de propósitos formativos oficiales para CNEYT-V (Ciencias Naturales, Experimentales y Tecnología V — Física).
 * Fuente: docs/programas-oficiales/extraidos/03-CIENCIAS-NATURALES.md
 *         PDF: 2025_MCC_CIENCIAS NATURALES_BN.pdf — Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-cneytv.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Cuestione los fenómenos naturales desde los principios del movimiento mecánico, ondulatorio y óptico, aplicando los modelos de la física clásica para explicar y predecir comportamientos en contextos cotidianos y tecnológicos.";

const PROGRESIONES_CNEYTV = [
  {
    codigo: "CNEYT-V-P01",
    numero: 1,
    titulo: "Aplica las leyes de Newton para analizar el movimiento y las fuerzas en situaciones cotidianas.",
    descripcion: "Aplica las leyes de Newton para analizar el movimiento y las fuerzas en situaciones cotidianas.",
    descripcion_extendida: "Aplica las leyes de Newton para analizar el movimiento y las fuerzas en situaciones cotidianas. Contenidos: primera ley de Newton (inercia): concepto y ejemplos; segunda ley de Newton: F = ma, relación fuerza-masa-aceleración, unidades (Newton, kg, m/s²); tercera ley de Newton: pares acción-reacción; tipos de fuerzas: normal, tensión, fricción, peso; diagramas de cuerpo libre; aplicación de las leyes en sistemas en reposo y en movimiento; problemas con planos inclinados; fricción estática y cinética; importancia de las leyes de Newton en ingeniería y transporte.",
    meta_aprendizaje: META,
    categoria: "Mecánica clásica",
    subcategoria: "Leyes de Newton: inercia, F=ma, acción-reacción",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: ["PM-V"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-V-P02",
    numero: 2,
    titulo: "Describe el movimiento rectilíneo uniforme y uniformemente acelerado con representaciones gráficas y algebraicas.",
    descripcion: "Describe el movimiento rectilíneo uniforme y uniformemente acelerado con representaciones gráficas y algebraicas.",
    descripcion_extendida: "Describe el movimiento rectilíneo uniforme y uniformemente acelerado con representaciones gráficas y algebraicas. Contenidos: cinemática: rama de la física que estudia el movimiento sin analizar sus causas; magnitudes cinemáticas: posición, desplazamiento, velocidad, aceleración; MRU (Movimiento Rectilíneo Uniforme): velocidad constante, x = x₀ + vt; MRUA (Movimiento Rectilíneo Uniformemente Acelerado): aceleración constante, v = v₀ + at, x = x₀ + v₀t + ½at²; gráficas posición-tiempo y velocidad-tiempo para MRU y MRUA; caída libre como caso especial de MRUA (a = g = 9.8 m/s²); análisis e interpretación de gráficas de movimiento.",
    meta_aprendizaje: META,
    categoria: "Mecánica clásica",
    subcategoria: "Cinemática: MRU y MRUA; gráficas posición-tiempo y velocidad-tiempo",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: ["PM-V"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-V-P03",
    numero: 3,
    titulo: "Analiza la gravitación universal y sus implicaciones en el sistema solar y la exploración espacial.",
    descripcion: "Analiza la gravitación universal y sus implicaciones en el sistema solar y la exploración espacial.",
    descripcion_extendida: "Analiza la gravitación universal y sus implicaciones en el sistema solar y la exploración espacial. Contenidos: ley de gravitación universal de Newton: F = Gm₁m₂/r²; constante gravitacional G = 6.674 × 10⁻¹¹ N·m²/kg²; peso y masa: diferencias conceptuales; campo gravitacional: g = GM/r²; variación del peso según la posición (Tierra vs. Luna vs. otros planetas); órbitas: movimiento circular bajo gravedad; leyes de Kepler: periodicidad, áreas iguales, relación T²/r³; agencias espaciales: NASA, ESA, Agencia Espacial Mexicana (AEM); satélites artificiales y telecomunicaciones.",
    meta_aprendizaje: META,
    categoria: "Mecánica clásica",
    subcategoria: "Ley de gravitación universal; órbitas y exploración espacial",
    ejes_articuladores: ["Pensamiento matemático y científico", "Sustentabilidad"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-V-P04",
    numero: 4,
    titulo: "Explica el movimiento ondulatorio y sus características (amplitud, frecuencia, longitud de onda, velocidad).",
    descripcion: "Explica el movimiento ondulatorio y sus características: amplitud, frecuencia, longitud de onda y velocidad de propagación.",
    descripcion_extendida: "Explica el movimiento ondulatorio y sus características (amplitud, frecuencia, longitud de onda, velocidad). Contenidos: concepto de onda: perturbación que transporta energía sin transportar materia; tipos de ondas: mecánicas (requieren medio) vs. electromagnéticas (no requieren medio); ondas transversales y longitudinales; parámetros de una onda: amplitud (A), período (T), frecuencia (f = 1/T), longitud de onda (λ), velocidad de propagación (v = λf); sonido como onda mecánica: velocidad en distintos medios; frecuencia y tono; intensidad y volumen; efecto Doppler: cambio de frecuencia percibida por movimiento relativo; ultrasonido y sus aplicaciones médicas en México (IMSS, ISSSTE).",
    meta_aprendizaje: META,
    categoria: "Ondas y electromagnetismo",
    subcategoria: "Ondas mecánicas: tipos, características, sonido",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-V-P05",
    numero: 5,
    titulo: "Describe el espectro electromagnético y sus aplicaciones tecnológicas y biomédicas.",
    descripcion: "Describe el espectro electromagnético y sus aplicaciones tecnológicas y biomédicas.",
    descripcion_extendida: "Describe el espectro electromagnético y sus aplicaciones tecnológicas y biomédicas. Contenidos: ondas electromagnéticas: naturaleza y velocidad de la luz (c = 3 × 10⁸ m/s); espectro electromagnético de menor a mayor frecuencia: ondas de radio, microondas, infrarrojo, luz visible, ultravioleta, rayos X, rayos gamma; aplicaciones cotidianas: radio AM/FM, WiFi, horno de microondas, control remoto IR, fibra óptica, teléfonos celulares (4G/5G); aplicaciones biomédicas: rayos X diagnósticos, radioterapia, resonancia magnética (MRI), tomografía computarizada; riesgos de la radiación ionizante y no ionizante; regulación en México: IFT (Instituto Federal de Telecomunicaciones).",
    meta_aprendizaje: META,
    categoria: "Ondas y electromagnetismo",
    subcategoria: "Espectro electromagnético: radio, microondas, IR, visible, UV, rayos X, gamma",
    ejes_articuladores: ["Pensamiento matemático y científico", "Sustentabilidad"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-V-P06",
    numero: 6,
    titulo: "Analiza los fenómenos ópticos (reflexión, refracción, dispersión) y su relación con la visión y la tecnología.",
    descripcion: "Analiza los fenómenos ópticos: reflexión, refracción y dispersión, y su relación con la visión humana y la tecnología.",
    descripcion_extendida: "Analiza los fenómenos ópticos (reflexión, refracción, dispersión) y su relación con la visión y la tecnología. Contenidos: naturaleza dual de la luz: onda y partícula (fotón); reflexión: ley de reflexión (ángulo incidente = ángulo reflejado); espejos planos, cóncavos y convexos; imágenes reales y virtuales; refracción: ley de Snell (n₁ · sen θ₁ = n₂ · sen θ₂); índice de refracción; lentes convergentes y divergentes; formación de imágenes en lentes (ecuación de lentes 1/f = 1/do + 1/di); dispersión: prismo y arcoíris; aplicaciones: lentes ópticas, microscopios, telescopios, fibra óptica; defectos de la visión: miopía, hipermetropía, astigmatismo y su corrección; el ojo humano como sistema óptico.",
    meta_aprendizaje: META,
    categoria: "Óptica",
    subcategoria: "Óptica geométrica: reflexión y refracción (Snell), lentes y espejos",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-V-P07",
    numero: 7,
    titulo: "Examina los principios del electromagnetismo y su aplicación en motores, generadores y tecnologías cotidianas.",
    descripcion: "Examina los principios del electromagnetismo y su aplicación en motores, generadores y tecnologías cotidianas.",
    descripcion_extendida: "Examina los principios del electromagnetismo y su aplicación en motores, generadores y tecnologías cotidianas. Contenidos: carga eléctrica y ley de Coulomb; campo eléctrico: concepto y líneas de campo; potencial eléctrico y voltaje; corriente eléctrica, resistencia y ley de Ohm (V = IR); circuitos eléctricos básicos: serie y paralelo; campo magnético: imanes, brújula, campo terrestre; fuerza magnética sobre cargas en movimiento (fuerza de Lorentz); inducción electromagnética: ley de Faraday; motores eléctricos: transformación de energía eléctrica en mecánica; generadores eléctricos: transformación de energía mecánica en eléctrica; transformadores; sistema eléctrico nacional de México (CFE) y generación de electricidad.",
    meta_aprendizaje: META,
    categoria: "Electromagnetismo",
    subcategoria: "Campos eléctrico y magnético, inducción, motores y generadores",
    ejes_articuladores: ["Pensamiento matemático y científico", "Sustentabilidad"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-V-P08",
    numero: 8,
    titulo: "Reflexiona sobre las implicaciones éticas y sociales del desarrollo tecnológico en física (energía nuclear, telecomunicaciones).",
    descripcion: "Reflexiona sobre las implicaciones éticas y sociales del desarrollo tecnológico en física, incluyendo la energía nuclear y las telecomunicaciones.",
    descripcion_extendida: "Reflexiona sobre las implicaciones éticas y sociales del desarrollo tecnológico en física (energía nuclear, telecomunicaciones). Contenidos: fisión nuclear: principio, reacción en cadena, masa crítica; energía nuclear: ventajas (baja emisión de CO₂, alta densidad energética) y riesgos (residuos radiactivos, accidentes como Chernóbil y Fukushima); debate sobre energía nuclear en México (Laguna Verde, CFE); fusión nuclear: investigación actual (ITER) y perspectivas; ética en el desarrollo tecnológico: responsabilidad del científico; telecomunicaciones y privacidad: vigilancia masiva, brecha digital; impacto ambiental de los dispositivos electrónicos: basura electrónica (e-waste); física al servicio de la justicia social.",
    meta_aprendizaje: META,
    categoria: "Física y sociedad",
    subcategoria: "Implicaciones éticas del desarrollo tecnológico en física",
    ejes_articuladores: ["Pensamiento crítico", "Sustentabilidad"],
    transversalidades: ["CS-III"],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedCNEYTV(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed CNEYT-V (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "CNEYT-V").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC CNEYT-V no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_CNEYTV.map((p) => ({
    codigo: p.codigo,
    uac_id: uacRow.id,
    numero: p.numero,
    titulo: p.titulo,
    descripcion: p.descripcion,
    meta_aprendizaje: p.meta_aprendizaje,
    categoria: p.categoria,
    subcategoria: p.subcategoria,
    descripcion_extendida: p.descripcion_extendida,
    ejes_articuladores: p.ejes_articuladores as unknown as string[],
    transversalidades: p.transversalidades as unknown as string[],
    tiempo_estimado_horas: p.tiempo_estimado_horas,
    es_placeholder: false,
  }));

  const { error } = await sb.from("progresiones").upsert(rows, { onConflict: "codigo" });
  if (error) throw new Error(`Error seeding CNEYT-V: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de CNEYT-V (es_placeholder=false)`);
  console.log("\n✅ Seed CNEYT-V completado: 8 propósitos oficiales insertados.\n");
}

if (
  process.env.NODE_ENV !== "test" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  config({ path: resolve(process.cwd(), ".env.local") });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) { console.error("Faltan variables de entorno"); process.exit(1); }
  const sb = createClient<Database>(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  seedCNEYTV(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}
