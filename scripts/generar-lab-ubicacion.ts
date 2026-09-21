/**
 * Genera src/lib/practicas/lab-ubicacion.generated.ts: en que UAC y semestre
 * vive cada laboratorio del registro.
 *
 * POR QUE EXISTE: la pagina de laboratorios sacaba su lista de la BD, de las
 * actividades con `practica_slug`. Eso confunde dos cosas distintas: QUE
 * laboratorios existen (lo dice el codigo) y DONDE cuelga cada uno del plan de
 * estudios (lo dice la BD). Con esa mezcla, un lab escrito y registrado pero
 * todavia sin actividad que lo apunte era invisible: 70 de 211.
 *
 * Aqui se deduce la ubicacion del codigo de actividad que el propio archivo del
 * laboratorio declara (p. ej. CNEYT-VI-P08-A1 -> UAC CNEYT-VI, semestre 6).
 * Si el archivo menciona varios codigos de la MISMA UAC, la UAC vale y el
 * codigo exacto no. Si no menciona ninguno, queda sin ubicar y el lab se lista
 * igual, en su propio grupo.
 *
 *   npx tsx scripts/generar-lab-ubicacion.ts
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { PRACTICAS_META } from "../src/components/practicas/registry-meta";
import { getUACPorCodigo } from "../src/lib/mccems/estructura";

const RAIZ = process.cwd();
const LABS = resolve(RAIZ, "src/components/practicas/labs");
const reg = readFileSync(resolve(RAIZ, "src/components/practicas/registry.tsx"), "utf8");

const compAArchivo = new Map<string, string>();
for (const m of reg.matchAll(/const\s+(\w+)\s*=\s*dynamic\(\s*\(\)\s*=>\s*import\(\s*["']\.\/labs\/([\w./-]+)["']/g)) {
  compAArchivo.set(m[1]!, m[2]!);
}
const slugAComp = new Map<string, string>();
for (const m of reg.matchAll(/^\s+"?([a-z0-9_-]+)"?:\s*\{[^}]*Component:\s*(\w+)/gm)) {
  slugAComp.set(m[1]!, m[2]!);
}

interface Ubic { uacCodigo: string | null; semestre: number | null; actividadCodigo: string | null }
const mapa: Record<string, Ubic> = {};
let conUac = 0, conCodigo = 0, sinUbicar = 0;

for (const slug of Object.keys(PRACTICAS_META).sort()) {
  const arch = compAArchivo.get(slugAComp.get(slug) ?? "");
  const ruta = arch ? resolve(LABS, arch + ".tsx") : null;
  let codigos: string[] = [];
  if (ruta && existsSync(ruta)) {
    const txt = readFileSync(ruta, "utf8");
    codigos = [...new Set([...txt.matchAll(/\b([A-Z]{2,6}-[IVX]+-P\d{2}-A\d)\b/g)].map((m) => m[1]!))];
  }
  const uacs = [...new Set(codigos.map((c) => c.replace(/-P\d{2}-A\d$/, "")))];
  const uacCodigo = uacs.length === 1 ? uacs[0]! : null;
  const uac = uacCodigo ? getUACPorCodigo(uacCodigo) : undefined;
  const actividadCodigo = codigos.length === 1 ? codigos[0]! : null;
  mapa[slug] = { uacCodigo: uac ? uacCodigo : null, semestre: uac?.semestre ?? null, actividadCodigo: uac ? actividadCodigo : null };
  if (mapa[slug]!.uacCodigo) conUac++; else sinUbicar++;
  if (mapa[slug]!.actividadCodigo) conCodigo++;
}

const cuerpo = Object.entries(mapa)
  .map(([slug, u]) => `  ${JSON.stringify(slug)}: { uacCodigo: ${JSON.stringify(u.uacCodigo)}, semestre: ${u.semestre ?? "null"}, actividadCodigo: ${JSON.stringify(u.actividadCodigo)} },`)
  .join("\n");

writeFileSync(
  resolve(RAIZ, "src/lib/practicas/lab-ubicacion.generated.ts"),
  `/**
 * Donde vive cada laboratorio del registro: UAC y semestre.
 *
 * AUTO-GENERADO. NO EDITAR A MANO. Para regenerar:
 *   npx tsx scripts/generar-lab-ubicacion.ts
 *
 * \`uacCodigo\` nulo = el archivo del laboratorio no declara de que UAC cuelga.
 * El laboratorio existe y se lista igual, en el grupo "Sin ubicar".
 */

export interface LabUbicacion {
  uacCodigo: string | null;
  semestre: number | null;
  /** Solo cuando el archivo declara UNA sola actividad. */
  actividadCodigo: string | null;
}

export const LAB_UBICACION: Record<string, LabUbicacion> = {
${cuerpo}
};
`,
  "utf8",
);
console.log(`ubicacion generada: ${Object.keys(mapa).length} labs | con UAC: ${conUac} | con codigo exacto: ${conCodigo} | sin ubicar: ${sinUbicar}`);
