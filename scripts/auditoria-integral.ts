/**
 * AUDITORÍA INTEGRAL DE LA PLATAFORMA (solo lectura).
 *
 * Cruza la BD de Supabase (PROD) contra el disco del repo para responder las
 * preguntas operativas antes de abrir la plataforma en escuelas reales:
 *   1. ¿Faltan laboratorios? (practica_slug rotos, slugs huérfanos, cobertura)
 *   2. ¿Faltan imágenes? (actividades sin imagen, imágenes rotas en disco)
 *   3. ¿Faltan videos?    (video_con_preguntas sin url_video / placeholder)
 *
 * NO escribe en la BD. Emite scripts/out/auditoria-integral.json + resumen.
 *
 * Uso: npx tsx scripts/auditoria-integral.ts
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

type Json = Record<string, unknown>;

const PUBLIC_DIR = resolve(process.cwd(), "public");

/** Slugs registrados en el registry de prácticas (parse textual, sin importar three.js). */
function slugsDelRegistry(): string[] {
  const src = readFileSync(resolve(process.cwd(), "src/components/practicas/registry.tsx"), "utf8");
  const bloque = src.slice(src.indexOf("PRACTICAS"));
  const slugs = new Set<string>();
  for (const m of bloque.matchAll(/^\s{2}"?([a-z0-9][a-z0-9-]*)"?:\s*\{/gm)) slugs.add(m[1]);
  return [...slugs];
}

/** LAB_TEMA de lab-imagenes.ts (slug -> tema). */
function labTema(): Record<string, string> {
  const src = readFileSync(resolve(process.cwd(), "src/lib/practicas/lab-imagenes.ts"), "utf8");
  const out: Record<string, string> = {};
  for (const m of src.matchAll(/^\s*"([a-z0-9][a-z0-9-]*)":\s*"([a-z0-9-]+)",/gm)) out[m[1]] = m[2];
  return out;
}

/**
 * ¿Existe en disco la carátula propia de este laboratorio? Replica el orden de
 * `mejorImagenDeLab`, que antes que el tema busca public/media/semN/labs/<slug>.webp.
 */
function existeCaratulaPropia(slug: string): boolean {
  for (let sem = 1; sem <= 6; sem++) {
    if (existsSync(resolve(PUBLIC_DIR, "media", `sem${sem}`, "labs", `${slug}.webp`))) return true;
  }
  return false;
}

async function main() {
  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Carga completa -----------------------------------------------------------
  const { data: uacs, error: eU } = await sb
    .from("uac").select("id, codigo, nombre, semestre, area_id, total_progresiones").order("semestre");
  if (eU) throw new Error(`uac: ${eU.message}`);

  const { data: progs, error: eP } = await sb
    .from("progresiones").select("id, codigo, numero, titulo, uac_id").order("numero");
  if (eP) throw new Error(`progresiones: ${eP.message}`);

  type Act = {
    id: string; codigo: string; titulo: string; tipo: string; tipo_codigo: string | null;
    estado: string; practica_slug: string | null; progresion_id: string | null; contenido: Json;
  };
  const acts: Act[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("actividades")
      .select("id, codigo, titulo, tipo, tipo_codigo, estado, practica_slug, progresion_id, contenido")
      .order("codigo").range(from, from + 999);
    if (error) throw new Error(`actividades: ${error.message}`);
    if (!data?.length) break;
    acts.push(...(data as unknown as Act[]));
    if (data.length < 1000) break;
  }

  const uacById = new Map((uacs ?? []).map((u) => [u.id, u]));
  const progById = new Map((progs ?? []).map((p) => [p.id, p]));
  const semDeAct = (a: Act) => {
    const p = a.progresion_id ? progById.get(a.progresion_id) : null;
    const u = p ? uacById.get(p.uac_id!) : null;
    return u?.semestre ?? null;
  };
  const uacDeAct = (a: Act) => {
    const p = a.progresion_id ? progById.get(a.progresion_id) : null;
    return p ? uacById.get(p.uac_id!) ?? null : null;
  };

  const rep: Record<string, unknown> = { generado: new Date().toISOString() };

  // 1. Estructura ------------------------------------------------------------
  const porSem: Record<number, { uac: number; prog: number; act: number; publicadas: number }> = {};
  for (const u of uacs ?? []) {
    porSem[u.semestre] ??= { uac: 0, prog: 0, act: 0, publicadas: 0 };
    porSem[u.semestre].uac++;
  }
  for (const p of progs ?? []) {
    const u = uacById.get(p.uac_id!);
    if (u) porSem[u.semestre].prog++;
  }
  const sinProgresion: string[] = [];
  for (const a of acts) {
    const s = semDeAct(a);
    if (s == null) { sinProgresion.push(a.codigo); continue; }
    porSem[s].act++;
    if (a.estado === "publicada") porSem[s].publicadas++;
  }
  const dupCodigos = Object.entries(
    acts.reduce<Record<string, number>>((m, a) => { m[a.codigo] = (m[a.codigo] ?? 0) + 1; return m; }, {})
  ).filter(([, n]) => n > 1).map(([c]) => c);

  const progSinActividades = (progs ?? [])
    .filter((p) => !acts.some((a) => a.progresion_id === p.id))
    .map((p) => p.codigo);

  const noPublicadas = acts.filter((a) => a.estado !== "publicada")
    .map((a) => ({ codigo: a.codigo, estado: a.estado }));

  const porTipo = acts.reduce<Record<string, number>>((m, a) => {
    m[a.tipo] = (m[a.tipo] ?? 0) + 1; return m;
  }, {});

  rep.estructura = {
    totales: {
      uac: uacs?.length ?? 0, progresiones: progs?.length ?? 0, actividades: acts.length,
      publicadas: acts.filter((a) => a.estado === "publicada").length,
    },
    porSemestre: porSem,
    porTipo,
    actividadesSinProgresion: sinProgresion,
    codigosDuplicados: dupCodigos,
    progresionesSinActividades: progSinActividades,
    actividadesNoPublicadas: noPublicadas,
  };

  // 2. Laboratorios ----------------------------------------------------------
  const registry = slugsDelRegistry();
  const conSlug = acts.filter((a) => a.practica_slug);
  const usados = new Set(conSlug.map((a) => a.practica_slug!));
  const rotos = conSlug.filter((a) => !registry.includes(a.practica_slug!))
    .map((a) => ({ codigo: a.codigo, slug: a.practica_slug }));
  const huerfanos = registry.filter((s) => !usados.has(s));
  const dupSlug = Object.entries(
    conSlug.reduce<Record<string, string[]>>((m, a) => {
      (m[a.practica_slug!] ??= []).push(a.codigo); return m;
    }, {})
  ).filter(([, v]) => v.length > 1);

  /**
   * LO QUE DE VERDAD HAY QUE VIGILAR NO ES "¿TIENE LABORATORIO?".
   *
   * 103 de las 240 progresiones no tienen laboratorio, y eso por sí solo no es
   * un defecto: un laboratorio 3D de "figuras retóricas" o de "present perfect"
   * sería un disfraz, no una práctica. Medir sólo `practica_slug` produce un
   * número alarmante que nunca va a bajar a cero y que además no habría que
   * querer que baje.
   *
   * El defecto real es una progresión donde el alumno sólo lee, responde y
   * escribe, sin una sola actividad que se manipule. Eso sí debe ser cero, y
   * esto es lo que lo mide: cuenta como práctica tanto un laboratorio como
   * cualquiera de los tipos dinámicos.
   */
  const TIPOS_MANIPULABLES = new Set([
    "simulacion", "ordenar_secuencia", "relacionar_columnas",
    "clasificar_categorias", "caso_decision", "reto_cronometrado",
  ]);
  const sinNadaManipulable = (progs ?? [])
    .filter((p) => !acts.some(
      (a) => a.progresion_id === p.id && (a.practica_slug || TIPOS_MANIPULABLES.has(a.tipo))
    ))
    .map((p) => p.codigo);

  const coberturaUac = (uacs ?? []).map((u) => {
    const ps = (progs ?? []).filter((p) => p.uac_id === u.id);
    const conPractica = ps.filter((p) => acts.some((a) => a.progresion_id === p.id && a.practica_slug));
    return {
      uac: u.codigo, nombre: u.nombre, semestre: u.semestre, area: u.area_id,
      progresiones: ps.length, conPractica: conPractica.length,
      sinPractica: ps.filter((p) => !conPractica.includes(p)).map((p) => p.numero),
    };
  }).sort((a, b) => a.semestre - b.semestre || a.uac.localeCompare(b.uac));

  rep.laboratorios = {
    progresionesSinNadaManipulable: sinNadaManipulable,
    slugsEnRegistry: registry.length,
    actividadesConPractica: conSlug.length,
    slugsUsados: usados.size,
    slugsRotos: rotos,
    slugsHuerfanos: huerfanos,
    slugsEnMasDeUnaActividad: dupSlug,
    coberturaPorUac: coberturaUac,
  };

  // 3. Imágenes --------------------------------------------------------------
  // `infografia` NO va en esta lista, y no es un olvido. Una infografía se
  // dibuja con sus propios `puntos_clave` en <LaminaInfografia>: es DOM, se lee
  // en un lector de pantalla y no puede dar 404. Ponerle una foto encima sería
  // decoración sobre el contenido real. Las 27 que no tienen `url_imagen`
  // están completas; contarlas aquí sería una alarma que nunca se puede apagar.
  const TIPOS_CON_IMAGEN = new Set([
    "lectura", "quiz_multiple_opcion", "quiz_verdadero_falso", "fill_blanks",
    "ejercicio_matematico", "reflexion_escrita", "debate_estructurado",
    "glosario_interactivo", "autoevaluacion",
  ]);
  const sinImagen: Array<{ codigo: string; tipo: string; sem: number | null }> = [];
  const imgRotas: Array<{ codigo: string; ruta: string }> = [];
  const miniRotas: Array<{ codigo: string; ruta: string }> = [];
  const sinMiniatura: Array<{ codigo: string; sem: number | null }> = [];

  for (const a of acts) {
    const c = (a.contenido ?? {}) as Json;
    const sem = semDeAct(a);
    if (a.tipo === "video_con_preguntas") {
      const mini = c.url_miniatura as string | undefined;
      if (!mini) sinMiniatura.push({ codigo: a.codigo, sem });
      else if (mini.startsWith("/") && !existsSync(resolve(PUBLIC_DIR, mini.slice(1))))
        miniRotas.push({ codigo: a.codigo, ruta: mini });
      continue;
    }
    const img = c.url_imagen as string | undefined;
    if (TIPOS_CON_IMAGEN.has(a.tipo)) {
      if (!img) sinImagen.push({ codigo: a.codigo, tipo: a.tipo, sem });
      else if (img.startsWith("/") && !existsSync(resolve(PUBLIC_DIR, img.slice(1))))
        imgRotas.push({ codigo: a.codigo, ruta: img });
    } else if (img && img.startsWith("/") && !existsSync(resolve(PUBLIC_DIR, img.slice(1)))) {
      imgRotas.push({ codigo: a.codigo, ruta: img });
    }
  }

  // Un laboratorio se queda sin carátula sólo si le fallan LAS DOS vías:
  // no tiene imagen propia generada Y su slug no está en el mapa de temas.
  // Medir únicamente el mapa daba 33 falsas alarmas —los 33 labs no-STEM
  // tienen carátula propia y jamás llegan a consultar el tema—, y una alarma
  // que no se puede apagar acaba enseñando a ignorar el informe entero.
  const temas = labTema();
  const labsSinTema = [...usados].filter(
    (s) => !temas[s] && !existeCaratulaPropia(s)
  );
  const temasSinArchivo = [...new Set(Object.values(temas))]
    .filter((t) => !existsSync(resolve(PUBLIC_DIR, "labs", `${t}.webp`)));

  rep.imagenes = {
    actividadesSinImagen: sinImagen,
    imagenesRotas: imgRotas,
    videosSinMiniatura: sinMiniatura,
    miniaturasRotas: miniRotas,
    labsSinTemaDeImagen: labsSinTema,
    temasSinArchivoWebp: temasSinArchivo,
  };

  // 4. Videos ----------------------------------------------------------------
  const videos = acts.filter((a) => a.tipo === "video_con_preguntas");
  const sinUrl: string[] = [];
  const placeholder: Array<{ codigo: string; url: string }> = [];
  const urls: Array<{ codigo: string; url: string; sem: number | null; uac: string | null }> = [];
  const sinPreguntas: string[] = [];
  for (const v of videos) {
    const c = (v.contenido ?? {}) as Json;
    const url = (c.url_video as string | undefined) ?? "";
    const u = uacDeAct(v);
    if (!url) { sinUrl.push(v.codigo); continue; }
    if (/placeholder|example\.com|TODO|pendiente/i.test(url)) placeholder.push({ codigo: v.codigo, url });
    urls.push({ codigo: v.codigo, url, sem: semDeAct(v), uac: u?.codigo ?? null });
    const preg = c.preguntas as unknown[] | undefined;
    if (!Array.isArray(preg) || preg.length === 0) sinPreguntas.push(v.codigo);
  }
  const desalineados = acts.filter((a) => a.tipo_codigo && a.tipo !== a.tipo_codigo)
    .map((a) => ({ codigo: a.codigo, tipo: a.tipo, tipo_codigo: a.tipo_codigo }));

  const progSinVideo = (progs ?? []).filter(
    (p) => !videos.some((v) => v.progresion_id === p.id)
  ).map((p) => {
    const u = uacById.get(p.uac_id!);
    return { prog: p.codigo, uac: u?.codigo ?? "?", sem: u?.semestre ?? null };
  });

  rep.videos = {
    total: videos.length,
    sinUrl, placeholder, sinPreguntas,
    tipoDesalineado: desalineados,
    progresionesSinVideo: progSinVideo,
    hosts: Object.entries(urls.reduce<Record<string, number>>((m, v) => {
      let h = "relativa";
      try { h = new URL(v.url).host; } catch { /* relativa */ }
      m[h] = (m[h] ?? 0) + 1; return m;
    }, {})),
    listado: urls,
  };

  // Salida -------------------------------------------------------------------
  mkdirSync(resolve(process.cwd(), "scripts/out"), { recursive: true });
  writeFileSync(
    resolve(process.cwd(), "scripts/out/auditoria-integral.json"),
    JSON.stringify(rep, null, 2), "utf8"
  );

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const e = rep.estructura as any, l = rep.laboratorios as any,
        i = rep.imagenes as any, v = rep.videos as any;
  console.log("\n======== AUDITORIA INTEGRAL ========");
  console.log(`UAC ${e.totales.uac} | Progresiones ${e.totales.progresiones} | Actividades ${e.totales.actividades} (publicadas ${e.totales.publicadas})`);
  console.log(`  sin progresion: ${e.actividadesSinProgresion.length} | codigos dup: ${e.codigosDuplicados.length} | prog sin actividades: ${e.progresionesSinActividades.length} | no publicadas: ${e.actividadesNoPublicadas.length}`);
  console.log(`  por tipo: ${JSON.stringify(e.porTipo)}`);
  const sinTocar = l.progresionesSinNadaManipulable as string[];
  console.log(
    `\nPRÁCTICA: progresiones sin NADA manipulable ${sinTocar.length}/${e.totales.progresiones}` +
    (sinTocar.length ? `  -> ${sinTocar.slice(0, 8).join(", ")}` : "  ✓")
  );
  console.log(`LABS: registry ${l.slugsEnRegistry} | asociados ${l.actividadesConPractica} | usados ${l.slugsUsados}`);
  console.log(`  rotos ${l.slugsRotos.length} | huerfanos ${l.slugsHuerfanos.length} | dup ${l.slugsEnMasDeUnaActividad.length}`);
  console.log(`\nIMAGENES: sin imagen ${i.actividadesSinImagen.length} | rotas ${i.imagenesRotas.length} | videos sin miniatura ${i.videosSinMiniatura.length} | miniaturas rotas ${i.miniaturasRotas.length}`);
  console.log(`  labs sin tema ${i.labsSinTemaDeImagen.length} | temas sin webp ${i.temasSinArchivoWebp.length}`);
  console.log(`\nVIDEOS: ${v.total} | sin url ${v.sinUrl.length} | placeholder ${v.placeholder.length} | sin preguntas ${v.sinPreguntas.length} | tipo desalineado ${v.tipoDesalineado.length}`);
  console.log(`  hosts: ${JSON.stringify(v.hosts)}`);
  console.log(`  progresiones sin video: ${v.progresionesSinVideo.length}/${e.totales.progresiones}`);
  console.log("\n-> scripts/out/auditoria-integral.json\n");
}

main().catch((err) => { console.error("ERROR:", err.message); process.exit(1); });
