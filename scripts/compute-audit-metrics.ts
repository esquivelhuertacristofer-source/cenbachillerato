/**
 * Calcula métricas agregadas de las 621 actividades para la auditoría.
 * Salida: docs/auditoria/data/metricas-basicas.json
 *
 * Uso: npx tsx scripts/compute-audit-metrics.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const src = resolve(process.cwd(), "docs/auditoria/data/actividades-bachillerato-completo.json");
const data = JSON.parse(readFileSync(src, "utf-8"));
const actividades: any[] = data.actividades;

// Palabras aproximadas (chars / 5.5)
function contarPalabras(texto: string): number {
  return Math.round(texto.trim().split(/\s+/).length);
}

// Detecta referencias mexicanas
const REFS_MX = ["INEGI","CONABIO","UNAM","SEP","CDMX","México","mexicano","AGN","IMSS","CONAFOR","Secretaría","federal","nacional","estado","municipio","indígena","náhuatl","maya","zapoteca","mestizo","Oaxaca","Jalisco","Chiapas","Yucatán","Veracruz","Monterrey","Guadalajara","CONEVAL","Banxico","IPN","CINVESTAV","CANACINTRA","CANIETI","Ley","NOM-","LGEEPA"];
function tienRefsMex(obj: any): boolean {
  const str = JSON.stringify(obj);
  return REFS_MX.some(ref => str.includes(ref));
}

interface MetricaActividad {
  codigo: string;
  tipo: string;
  uac: string;
  semestre: number;
  progresion: string;
  palabras_texto?: number;
  n_preguntas?: number;
  n_huecos?: number;
  n_criterios?: number;
  n_pistas?: number;
  tiene_retroalimentacion?: boolean;
  tiene_refs_mex: boolean;
  // señales de calidad
  d5_contenido_suficiente: boolean; // densidad de contenido
  campos_opcionales_usados: string[];
}

const metricas: MetricaActividad[] = [];

for (const act of actividades) {
  const c = act.contenido ?? {};
  const tiene_refs = tienRefsMex(c);
  const m: MetricaActividad = {
    codigo: act.codigo,
    tipo: act.tipo,
    uac: act.uac,
    semestre: act.semestre,
    progresion: act.progresion,
    tiene_refs_mex: tiene_refs,
    d5_contenido_suficiente: false,
    campos_opcionales_usados: [],
  };

  if (act.tipo === "lectura") {
    const palabras = c.texto ? contarPalabras(c.texto) : 0;
    m.palabras_texto = palabras;
    m.n_preguntas = c.preguntas_comprension?.length ?? 0;
    m.d5_contenido_suficiente = palabras >= 200 && m.n_preguntas >= 2;
    if (c.fuente) m.campos_opcionales_usados.push("fuente");
    if (c.nivel_lectura) m.campos_opcionales_usados.push("nivel_lectura");
  }
  else if (act.tipo === "reflexion_escrita") {
    m.n_criterios = c.criterios_evaluacion?.length ?? 0;
    m.n_pistas = c.pistas?.length ?? 0;
    m.palabras_texto = c.prompt ? contarPalabras(c.prompt) : 0;
    m.d5_contenido_suficiente = m.n_criterios >= 3 && m.n_pistas >= 2 && m.palabras_texto >= 20;
    if (c.formato_esperado) m.campos_opcionales_usados.push("formato_esperado");
    if (c.longitud_minima_palabras) m.campos_opcionales_usados.push("longitud_min");
  }
  else if (act.tipo === "quiz_multiple_opcion") {
    m.n_preguntas = c.preguntas?.length ?? 0;
    m.tiene_retroalimentacion = c.preguntas?.some((p: any) => p.retroalimentacion && p.retroalimentacion.length > 5) ?? false;
    m.d5_contenido_suficiente = m.n_preguntas >= 4;
    if (m.tiene_retroalimentacion) m.campos_opcionales_usados.push("retroalimentacion");
    if (c.mezclar_preguntas) m.campos_opcionales_usados.push("mezclar_preguntas");
  }
  else if (act.tipo === "quiz_verdadero_falso") {
    m.n_preguntas = c.preguntas?.length ?? 0;
    m.tiene_retroalimentacion = c.preguntas?.some((p: any) => p.retroalimentacion && p.retroalimentacion.length > 5) ?? false;
    m.d5_contenido_suficiente = m.n_preguntas >= 6;
    if (m.tiene_retroalimentacion) m.campos_opcionales_usados.push("retroalimentacion");
  }
  else if (act.tipo === "fill_blanks") {
    m.n_huecos = c.huecos?.length ?? 0;
    m.palabras_texto = c.texto_con_huecos ? contarPalabras(c.texto_con_huecos) : 0;
    m.d5_contenido_suficiente = m.n_huecos >= 5 && m.palabras_texto >= 60;
    if (c.instrucciones) m.campos_opcionales_usados.push("instrucciones");
  }
  else if (act.tipo === "ejercicio_matematico") {
    m.palabras_texto = c.problema ? contarPalabras(c.problema) : 0;
    const n_pasos = c.pasos_guia?.length ?? 0;
    m.d5_contenido_suficiente = m.palabras_texto >= 20 && n_pasos >= 3;
    if (n_pasos > 0) m.campos_opcionales_usados.push("pasos_guia");
    if (c.tolerancia_error) m.campos_opcionales_usados.push("tolerancia_error");
    if (c.contexto) m.campos_opcionales_usados.push("contexto");
  }
  else if (act.tipo === "debate_estructurado") {
    m.palabras_texto = c.tema ? contarPalabras(c.tema) : 0;
    const n_arg = c.argumentos_guia?.length ?? 0;
    const n_posturas = c.posturas?.length ?? 0;
    m.d5_contenido_suficiente = n_arg >= 2 && n_posturas >= 2;
    if (n_arg > 0) m.campos_opcionales_usados.push("argumentos_guia");
    if (c.reglas) m.campos_opcionales_usados.push("reglas");
    if (c.tiempo_argumentacion_minutos) m.campos_opcionales_usados.push("tiempo");
  }
  else if (act.tipo === "simulacion") {
    const n_vars = c.variables_a_explorar?.length ?? 0;
    const n_refl = c.preguntas_reflexion?.length ?? 0;
    m.palabras_texto = c.descripcion ? contarPalabras(c.descripcion) : 0;
    m.d5_contenido_suficiente = n_vars >= 2 && n_refl >= 2 && m.palabras_texto >= 30;
    if (n_vars > 0) m.campos_opcionales_usados.push("variables_a_explorar");
    if (n_refl > 0) m.campos_opcionales_usados.push("preguntas_reflexion");
  }
  else if (act.tipo === "autoevaluacion") {
    m.n_criterios = c.criterios?.length ?? 0;
    m.d5_contenido_suficiente = m.n_criterios >= 4;
    if (c.reflexion_final_prompt) m.campos_opcionales_usados.push("reflexion_final_prompt");
    if (c.visible_para_docente !== undefined) m.campos_opcionales_usados.push("visible_para_docente");
  }
  else if (act.tipo === "infografia") {
    m.n_preguntas = c.puntos_clave?.length ?? 0;
    m.d5_contenido_suficiente = m.n_preguntas >= 4 && !!c.descripcion_accesible;
    if (c.actividad_post) m.campos_opcionales_usados.push("actividad_post");
    if (c.descripcion_accesible) m.campos_opcionales_usados.push("descripcion_accesible");
  }
  else if (act.tipo === "glosario_interactivo") {
    m.n_preguntas = c.terminos?.length ?? 0;
    m.d5_contenido_suficiente = m.n_preguntas >= 6;
  }
  else if (act.tipo === "video_con_preguntas") {
    m.n_preguntas = c.preguntas?.length ?? 0;
    m.d5_contenido_suficiente = m.n_preguntas >= 3 && !!c.descripcion_video;
    if (c.subtitulos_disponibles) m.campos_opcionales_usados.push("subtitulos");
    if (c.descripcion_video) m.campos_opcionales_usados.push("descripcion_video");
  }

  metricas.push(m);
}

// Resumen por tipo
const resumenTipo: Record<string, any> = {};
for (const tipo of ["lectura","reflexion_escrita","quiz_multiple_opcion","quiz_verdadero_falso","ejercicio_matematico","fill_blanks","debate_estructurado","simulacion","autoevaluacion","infografia","glosario_interactivo","video_con_preguntas"]) {
  const subset = metricas.filter(m => m.tipo === tipo);
  if (subset.length === 0) continue;
  const con_refs = subset.filter(m => m.tiene_refs_mex).length;
  const suficiente = subset.filter(m => m.d5_contenido_suficiente).length;
  const avg_palabras = subset.filter(m => m.palabras_texto !== undefined).reduce((s, m) => s + (m.palabras_texto ?? 0), 0) / (subset.filter(m => m.palabras_texto !== undefined).length || 1);
  resumenTipo[tipo] = {
    total: subset.length,
    con_refs_mex: con_refs,
    pct_refs_mex: Math.round(con_refs / subset.length * 100),
    contenido_suficiente: suficiente,
    pct_suficiente: Math.round(suficiente / subset.length * 100),
    avg_palabras: Math.round(avg_palabras),
  };
}

// Resumen por UAC
const resumenUac: Record<string, any> = {};
const uacs = [...new Set(metricas.map(m => m.uac))].sort();
for (const uac of uacs) {
  const subset = metricas.filter(m => m.uac === uac);
  const con_refs = subset.filter(m => m.tiene_refs_mex).length;
  const suficiente = subset.filter(m => m.d5_contenido_suficiente).length;
  const tipos_usados = [...new Set(subset.map(m => m.tipo))];
  resumenUac[uac] = {
    semestre: subset[0].semestre,
    total: subset.length,
    con_refs_mex: con_refs,
    pct_refs_mex: Math.round(con_refs / subset.length * 100),
    contenido_suficiente: suficiente,
    pct_suficiente: Math.round(suficiente / subset.length * 100),
    tipos_usados,
    n_tipos: tipos_usados.length,
  };
}

// Actividades con contenido insuficiente
const insuficientes = metricas.filter(m => !m.d5_contenido_suficiente).map(m => m.codigo);

const out = {
  fecha: new Date().toISOString(),
  totales: {
    actividades: metricas.length,
    con_refs_mex: metricas.filter(m => m.tiene_refs_mex).length,
    pct_refs_mex: Math.round(metricas.filter(m => m.tiene_refs_mex).length / metricas.length * 100),
    contenido_suficiente: metricas.filter(m => m.d5_contenido_suficiente).length,
    pct_suficiente: Math.round(metricas.filter(m => m.d5_contenido_suficiente).length / metricas.length * 100),
  },
  por_tipo: resumenTipo,
  por_uac: resumenUac,
  actividades_insuficientes: insuficientes,
  metricas_detalle: metricas,
};

const outPath = resolve(process.cwd(), "docs/auditoria/data/metricas-basicas.json");
writeFileSync(outPath, JSON.stringify(out, null, 2), "utf-8");

console.log("\n✅ Métricas calculadas:");
console.log(`   Total: ${metricas.length}`);
console.log(`   Con refs mexicanas: ${out.totales.con_refs_mex} (${out.totales.pct_refs_mex}%)`);
console.log(`   Contenido suficiente: ${out.totales.contenido_suficiente} (${out.totales.pct_suficiente}%)`);
console.log(`   Insuficientes: ${insuficientes.length}`);
console.log("\n   Por tipo:");
for (const [tipo, r] of Object.entries(resumenTipo)) {
  console.log(`     ${tipo}: ${(r as any).pct_suficiente}% suficiente, ${(r as any).pct_refs_mex}% refs-mx`);
}
console.log(`\n   Archivo: ${outPath}\n`);
