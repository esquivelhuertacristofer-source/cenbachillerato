/**
 * GENERA EL MODO «COMPLETA EL TEXTO» DE CADA LABORATORIO DOM.
 *
 * 44 de las 45 progresiones de los laboratorios DOM tienen una actividad
 * `fill_blanks`: un párrafo real, con huecos, pistas, respuesta correcta y
 * alternativas aceptadas. Está escrito, revisado y publicado — y ningún
 * laboratorio lo usaba. Este script lo vuelca a `{slug}-huecos.ts`, verbatim,
 * para que el lab tenga una mecánica que no sea arrastrar una etiqueta.
 *
 * El texto se parte por las marcas `___`: N huecos dan N+1 trozos. Si el número
 * de marcas no coincide con el de huecos declarados, NO se genera nada y se
 * reporta: un hueco sin respuesta es un espacio que el alumno nunca puede
 * acertar (pasó de verdad en 9 actividades, ver
 * scripts/reparar-huecos-sin-respuesta.ts).
 *
 * Uso:
 *   npx tsx scripts/generar-huecos-labs.ts --anclas <dump.json> [--dry] [--solo=slug]
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import type { AnclaLab } from "./dump-anclas-lab";

const LABS_DIR = resolve(process.cwd(), "src/components/practicas/labs");

interface HuecoBd {
  posicion?: number;
  respuesta_correcta?: string;
  alternativas_aceptadas?: string[];
  pista?: string;
}

const lit = (s: string) => JSON.stringify(s);

/** falacias-logica → FALACIAS_LOGICA_HUECOS */
export function nombreHuecos(slug: string): string {
  return `${slug.replace(/-/g, "_").toUpperCase()}_HUECOS`;
}

export interface Generado {
  slug: string;
  archivo: string;
  ancla: string;
  huecos: number;
  contenidoTs: string;
}

export function construirHuecos(lab: AnclaLab): Generado | { slug: string; motivo: string } {
  const act = lab.actividades.find((a) => a.tipo === "fill_blanks");
  if (!act) return { slug: lab.slug, motivo: "la progresión no tiene fill_blanks" };

  const c = (act.contenido ?? {}) as Record<string, unknown>;
  const texto = typeof c.texto_con_huecos === "string" ? c.texto_con_huecos : "";
  const huecos = Array.isArray(c.huecos) ? (c.huecos as HuecoBd[]) : [];
  if (!texto || huecos.length === 0) return { slug: lab.slug, motivo: "fill_blanks sin texto o sin huecos" };

  const partes = texto.split(/_{2,}/);
  if (partes.length - 1 !== huecos.length) {
    return {
      slug: lab.slug,
      motivo: `${partes.length - 1} marcas en el texto vs ${huecos.length} huecos declarados`,
    };
  }

  const ordenados = [...huecos].sort((a, b) => (a.posicion ?? 0) - (b.posicion ?? 0));
  const filas = ordenados.map((h) => {
    const alts = (h.alternativas_aceptadas ?? []).filter((x) => typeof x === "string" && x.trim());
    const pista = h.pista ? `, pista: ${lit(h.pista)}` : "";
    return `    { respuesta: ${lit(h.respuesta_correcta ?? "")}, alternativas: ${JSON.stringify(alts)}${pista} },`;
  });

  const instrucciones =
    typeof c.instrucciones === "string" && c.instrucciones.trim()
      ? c.instrucciones.trim()
      : "Completa el texto con la palabra que corresponde.";

  const nombre = nombreHuecos(lab.slug);
  const contenidoTs = `/**
 * «Completa el texto» — ${lab.slug}
 *
 * VERBATIM de ${act.codigo} (${act.titulo}), progresión ${lab.progresion?.codigo ?? "?"}.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const ${nombre}: TextoHuecosData = {
  ancla: ${lit(`${act.codigo} · ${act.titulo}`)},
  instrucciones: ${lit(instrucciones)},
  partes: [
${partes.map((p) => `    ${lit(p)},`).join("\n")}
  ],
  huecos: [
${filas.join("\n")}
  ],
};
`;

  return { slug: lab.slug, archivo: `${lab.slug}-huecos.ts`, ancla: act.codigo, huecos: huecos.length, contenidoTs };
}

function main() {
  const args = process.argv.slice(2);
  const iA = args.indexOf("--anclas");
  if (iA < 0) {
    console.error("Uso: npx tsx scripts/generar-huecos-labs.ts --anclas <dump.json> [--dry] [--solo=slug]");
    process.exit(1);
  }
  const dry = args.includes("--dry");
  const solo = args.find((a) => a.startsWith("--solo="))?.slice(7);
  const labs: AnclaLab[] = JSON.parse(readFileSync(resolve(process.cwd(), args[iA + 1]!), "utf8"));

  let n = 0;
  const sin: { slug: string; motivo: string }[] = [];
  for (const lab of labs) {
    if (solo && lab.slug !== solo) continue;
    const r = construirHuecos(lab);
    if ("motivo" in r) { sin.push(r); continue; }
    if (!dry) writeFileSync(resolve(LABS_DIR, r.archivo), r.contenidoTs, "utf8");
    n++;
    console.log(`${dry ? "[dry] " : ""}${r.archivo.padEnd(36)} ${r.huecos} huecos  ← ${r.ancla}`);
  }
  console.log(`\n${n} archivos ${dry ? "se escribirían" : "escritos"}.`);
  for (const s of sin) console.log(`  · ${s.slug} — ${s.motivo}`);
}

if (process.argv[1] && process.argv[1].includes("generar-huecos-labs")) main();
