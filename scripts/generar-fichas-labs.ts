/**
 * GENERA LA FICHA TEÓRICA DE LOS LABORATORIOS QUE NO LA TIENEN.
 *
 * Escribe `src/components/practicas/labs/{slug}-ficha.ts` con un
 * `FichaTeoricaData` armado ÍNTEGRAMENTE con texto de la base: no se redacta
 * nada. De dónde sale cada campo:
 *
 *   marcoTeorico  ← lectura.texto partido en párrafos, o infografia.puntos_clave,
 *                   o video.descripcion_video (en ese orden de preferencia)
 *   glosario      ← términos del último glosario_interactivo de la progresión
 *   conceptos     ← términos del primer glosario (cuando hay dos) o el
 *                   `glosario` embebido de la infografía
 *   aplicaciones  ← callouts de la lectura y `contexto_mexicano` de la infografía
 *   fuente        ← el campo `fuente` de esa misma actividad
 *   objetivos     ← los modos del propio laboratorio (parseados de su MODOS) +
 *                   el cuestionario. Describen lo que el alumno hará AQUÍ; es lo
 *                   único que no viene de la base, y por eso no inventa teoría.
 *   materiales    ← vacío a propósito: un lab DOM no tiene material de mesa y
 *                   rellenarlo sería inventar. La ficha oculta la pestaña sola.
 *
 * Uso:
 *   npx tsx scripts/generar-fichas-labs.ts --anclas <dump.json> [--dry] [--solo=slug]
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { inventario } from "./auditar-labs";
import type { AnclaLab } from "./dump-anclas-lab";

const RAIZ = process.cwd();
const LABS_DIR = resolve(RAIZ, "src/components/practicas/labs");

interface Termino { termino: string; definicion: string }

/** Nombre de la constante exportada: falacias-logica → FALACIAS_LOGICA_FICHA. */
export function nombreConstante(slug: string): string {
  return `${slug.replace(/-/g, "_").toUpperCase()}_FICHA`;
}

/** Escapa un texto para incrustarlo en un literal de comillas dobles de TS. */
function lit(s: string): string {
  return JSON.stringify(s);
}

/** Los modos que declara el propio laboratorio, para redactar los objetivos. */
function modosDelLab(componente: string): string[] {
  const f = resolve(LABS_DIR, `${componente}.tsx`);
  if (!existsSync(f)) return [];
  const src = readFileSync(f, "utf8");
  const i = src.indexOf("const MODOS");
  if (i < 0) return [];
  const bloque = src.slice(i, src.indexOf("];", i));
  return [...bloque.matchAll(/label:\s*"([^"]+)"/g)].map((m) => m[1]);
}

type Act = AnclaLab["actividades"][number];
type Contenido = Record<string, unknown>;

const cont = (a: Act) => (a.contenido ?? {}) as Contenido;
const texto = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

export interface FichaGenerada {
  slug: string;
  archivo: string;
  fuenteMarco: string;
  parrafos: number;
  conceptos: number;
  glosario: number;
  aplicaciones: number;
  contenidoTs: string;
}

export function construirFicha(lab: AnclaLab, componente: string): FichaGenerada | null {
  const acts = lab.actividades;
  const lectura = acts.find((a) => a.tipo === "lectura");
  const info = acts.find((a) => a.tipo === "infografia");
  const video = acts.find((a) => a.tipo === "video_con_preguntas");
  const glosarios = acts.filter((a) => a.tipo === "glosario_interactivo");

  // ── marco teórico ────────────────────────────────────────────────────
  let marco: string[] = [];
  let fuenteMarco = "";
  let fuente = "";
  let anclaCodigo = "";
  let anclaTitulo = "";

  if (lectura && texto(cont(lectura).texto)) {
    marco = texto(cont(lectura).texto).split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
    fuenteMarco = "lectura";
    fuente = texto(cont(lectura).fuente);
    anclaCodigo = lectura.codigo;
    anclaTitulo = lectura.titulo;
  } else if (info && Array.isArray(cont(info).puntos_clave)) {
    marco = (cont(info).puntos_clave as unknown[]).map((p) => texto(p)).filter(Boolean);
    fuenteMarco = "infografia";
    fuente = texto(cont(info).fuente);
    anclaCodigo = info.codigo;
    anclaTitulo = info.titulo;
  } else if (video && texto(cont(video).descripcion_video)) {
    marco = [texto(cont(video).descripcion_video)];
    fuenteMarco = "video";
    anclaCodigo = video.codigo;
    anclaTitulo = video.titulo;
  }
  if (marco.length === 0) return null;

  // ── glosario y conceptos ─────────────────────────────────────────────
  const terminosDe = (a: Act): Termino[] =>
    (Array.isArray(cont(a).terminos) ? (cont(a).terminos as Contenido[]) : [])
      .map((t) => ({ termino: texto(t.termino), definicion: texto(t.definicion) }))
      .filter((t) => t.termino && t.definicion);

  const glosario = glosarios.length ? terminosDe(glosarios[glosarios.length - 1]) : [];
  let conceptos: Termino[] = [];
  if (glosarios.length > 1) {
    // Con dos glosarios el primero es el temático de la progresión y el último
    // el de cierre; se conservan los dos, sin repetir términos.
    const vistos = new Set(glosario.map((g) => g.termino.toLowerCase()));
    conceptos = terminosDe(glosarios[0]).filter((t) => !vistos.has(t.termino.toLowerCase()));
  } else if (info && Array.isArray(cont(info).glosario)) {
    const vistos = new Set(glosario.map((g) => g.termino.toLowerCase()));
    conceptos = (cont(info).glosario as Contenido[])
      .map((t) => ({ termino: texto(t.termino), definicion: texto(t.definicion) }))
      .filter((t) => t.termino && t.definicion && !vistos.has(t.termino.toLowerCase()));
  }

  // ── aplicaciones (callouts + contexto mexicano) ──────────────────────
  const aplicaciones: string[] = [];
  if (lectura && Array.isArray(cont(lectura).callouts)) {
    for (const c of cont(lectura).callouts as Contenido[]) {
      const t = texto(c.contenido);
      if (t) aplicaciones.push(t);
    }
  }
  if (info) {
    const ctx = texto(cont(info).contexto_mexicano);
    if (ctx && !aplicaciones.includes(ctx)) aplicaciones.push(ctx);
  }

  // ── objetivos (lo que el alumno hace en este lab) ─────────────────────
  const modos = modosDelLab(componente);
  const objetivos = [
    ...modos.map((m) => `Completa el modo «${m}».`),
    "Aprueba el cuestionario de comprensión de la ficha.",
  ];

  const nombre = nombreConstante(lab.slug);
  const anclaTexto = `${anclaCodigo} · ${anclaTitulo}`.trim();

  /** Lista de términos como literal TS; una lista vacía se escribe en una línea. */
  const bloqueTerminos = (clave: string, ts: Termino[]) => {
    if (ts.length === 0) return `  ${clave}: [],`;
    const filas = ts
      .map((t) => `    { termino: ${lit(t.termino)}, definicion: ${lit(t.definicion)} },`)
      .join("\n");
    return `  ${clave}: [\n${filas}\n  ],`;
  };

  const contenidoTs = `/**
 * Ficha teórica — ${lab.slug}
 *
 * Contenido VERBATIM de la progresión ${lab.progresion?.codigo ?? "?"} (${lab.uac?.nombre ?? "?"}).
 * El marco teórico sale de ${anclaCodigo} (${fuenteMarco}); el glosario y los
 * conceptos, de las actividades de glosario de la misma progresión. Generado
 * por scripts/generar-fichas-labs.ts: si el contenido de la base cambia, se
 * regenera; no editar a mano sin avisar al script.
 */
import type { FichaTeoricaData } from "./_ficha";

export const ${nombre}: FichaTeoricaData = {
  ancla: ${lit(anclaTexto)},
  marcoTeorico: [
${marco.map((p) => `    ${lit(p)},`).join("\n")}
  ],
  objetivos: [
${objetivos.map((o) => `    ${lit(o)},`).join("\n")}
  ],
  materiales: [],
${bloqueTerminos("conceptos", conceptos)}
${bloqueTerminos("glosario", glosario)}${aplicaciones.length ? `\n  aplicaciones: [\n${aplicaciones.map((a) => `    ${lit(a)},`).join("\n")}\n  ],` : ""}${fuente ? `\n  fuente: ${lit(fuente)},` : ""}
};
`;

  return {
    slug: lab.slug,
    archivo: `${lab.slug}-ficha.ts`,
    fuenteMarco,
    parrafos: marco.length,
    conceptos: conceptos.length,
    glosario: glosario.length,
    aplicaciones: aplicaciones.length,
    contenidoTs,
  };
}

function main() {
  const args = process.argv.slice(2);
  const iA = args.indexOf("--anclas");
  if (iA < 0) {
    console.error("Uso: npx tsx scripts/generar-fichas-labs.ts --anclas <dump.json> [--dry] [--solo=slug]");
    process.exit(1);
  }
  const dry = args.includes("--dry");
  const solo = args.find((a) => a.startsWith("--solo="))?.slice(7);

  const labs: AnclaLab[] = JSON.parse(readFileSync(resolve(RAIZ, args[iA + 1]), "utf8"));
  const comp = new Map(inventario().map((f) => [f.slug, f.componente]));

  let escritas = 0;
  const sinMarco: string[] = [];
  for (const lab of labs) {
    if (solo && lab.slug !== solo) continue;
    const componente = comp.get(lab.slug);
    if (!componente) { console.log(`· ${lab.slug}: no está en el registry`); continue; }
    const ficha = construirFicha(lab, componente);
    if (!ficha) { sinMarco.push(lab.slug); continue; }

    const destino = resolve(LABS_DIR, ficha.archivo);
    if (!dry) writeFileSync(destino, ficha.contenidoTs, "utf8");
    escritas++;
    console.log(
      `${dry ? "[dry] " : ""}${ficha.archivo.padEnd(36)} marco:${String(ficha.parrafos).padStart(2)} (${ficha.fuenteMarco.padEnd(10)})` +
        ` conceptos:${String(ficha.conceptos).padStart(2)} glosario:${String(ficha.glosario).padStart(2)} aplic:${ficha.aplicaciones}`
    );
  }
  console.log(`\n${escritas} fichas ${dry ? "se escribirían" : "escritas"}.`);
  if (sinMarco.length) console.log(`⚠️  sin fuente de marco teórico: ${sinMarco.join(", ")}`);
}

if (process.argv[1] && process.argv[1].includes("generar-fichas-labs")) main();
