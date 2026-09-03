/**
 * HACE QUE LOS OBJETIVOS DE LOS LABORATORIOS 3D CUENTEN.
 *
 * Medido antes de tocar nada: 59 laboratorios 3D listan objetivos guiados que
 * se van marcando mientras el alumno explora, pero sólo 12 de los 95 guardan
 * marca alguna. En los otros el alumno cumple los objetivos, cierra la
 * pestaña y no queda nada: ni en el equipo ni en la base. El esfuerzo se
 * evapora, y con él la razón para terminarlos.
 *
 * Esto engancha esos objetivos a `useLogros` (para que no se desmarquen) y a
 * `useEstrellas` (para que la marca se guarde y se recupere en otro equipo).
 * Las estrellas salen de la proporción de objetivos cumplidos:
 *
 *     todos → 3★   ·   dos tercios → 2★   ·   uno → 1★
 *
 * La marca se registra en un efecto que sólo mira cuántos objetivos van; el
 * `MAX` lo aplica `useEstrellas`, así que nunca baja.
 *
 * Idempotente. Los laboratorios que ya tienen `useEstrellas` no se tocan: esos
 * ya tienen su propio reto y su propia regla.
 *
 * Uso: npx tsx scripts/aplicar-logros-labs.ts [--dry] [--solo=slug]
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { inventario } from "./auditar-labs";


const RE_OBJETIVOS = /\n(  const objetivos = \[\n(?:.*?\n)*?  \];\n)/;
const RE_RENDER = /\{objetivos\.map\(\(o, i\) => \(\n(?:.*?\n)*?\s*\)\)\}/;

interface Resultado { slug: string; ok: boolean; motivo?: string }

/**
 * `archivoRel` viene del inventario, que lo resuelve por la ruta del `import`
 * del registry. Hay archivos que exportan TRES laboratorios (LabAlgebraTiles,
 * LabEstadistica), así que el nombre del componente no sirve como nombre de
 * archivo.
 */
export function cablearLogros(slug: string, archivoRel: string, dry: boolean): Resultado {
  const archivo = resolve(process.cwd(), archivoRel);
  if (!existsSync(archivo)) return { slug, ok: false, motivo: `no existe ${archivoRel}` };

  const original = readFileSync(archivo, "utf8");
  if (original.includes("useEstrellas")) return { slug, ok: true, motivo: "ya tiene su propio reto" };
  if (original.includes("useLogros") && original.includes("registraEstrellas")) {
    return { slug, ok: true, motivo: "ya estaba" };
  }

  const crlf = original.includes("\r\n");
  let src = crlf ? original.split("\r\n").join("\n") : original;

  const mObj = src.match(RE_OBJETIVOS);
  if (!mObj) return { slug, ok: false, motivo: "no tiene lista de objetivos con la forma esperada" };
  const mRender = src.match(RE_RENDER);
  if (!mRender) return { slug, ok: false, motivo: "no se encontró el render de los objetivos" };

  // 1 ── imports ──────────────────────────────────────────────────────────
  const anclaImport = 'import { LabSfx } from "./lab-audio";';
  if (!src.includes(anclaImport)) return { slug, ok: false, motivo: "sin import de LabSfx" };
  if (!src.includes('from "./_partida"')) {
    src = src.replace(anclaImport, `${anclaImport}\nimport { useLogros } from "./_partida";`);
  }
  src = src.replace(
    anclaImport,
    `${anclaImport}\nimport { useEstrellas } from "@/lib/hooks/useEstrellas";`
  );

  // `useEffect` hace falta para registrar la marca; puede que ya esté importado.
  const mReact = src.match(/import \{([^}]*)\} from "react";/);
  if (!mReact) return { slug, ok: false, motivo: "sin import de react" };
  if (!/\buseEffect\b/.test(mReact[1])) {
    src = src.replace(mReact[0], `import {${mReact[1].replace(/\s*$/, "")}, useEffect } from "react";`);
  }

  // 2 ── clave del reto ───────────────────────────────────────────────────
  if (!src.includes("const RETO_KEY")) {
    // No todos exportan en la misma línea: los hay `export function Lab…` y
    // `function Lab…` con el `export` más abajo.
    const iComp = src.search(/\n(?:export )?function Lab\w+\(/);
    if (iComp < 0) return { slug, ok: false, motivo: "no se encontró la función del laboratorio" };
    src = src.slice(0, iComp) + `\nconst RETO_KEY = "cen-${slug}-reto";\n` + src.slice(iComp);
  }

  // 3 ── enganche de logros + registro de la marca ────────────────────────
  // Los nombres llevan sufijo "Lab" porque varios laboratorios ya declaran sus
  // propios `logros` y `total`, y sin el sufijo el codemod los redeclara.
  const bloque =
    `  // Los objetivos se recuerdan (algunos dependían del modo y se desmarcaban\n` +
    `  // solos) y se convierten en la marca del laboratorio, que antes no se\n` +
    `  // guardaba en ninguna parte.\n` +
    `  const { logros: logrosLab, cumplidos: cumplidosLab, total: totalLab } = useLogros(objetivos.map((o) => o.done));\n` +
    `  const { registraEstrellas } = useEstrellas(RETO_KEY);\n` +
    `  useEffect(() => {\n` +
    `    if (cumplidosLab === 0) return;\n` +
    `    const est = cumplidosLab >= totalLab ? 3 : cumplidosLab >= Math.ceil((totalLab * 2) / 3) ? 2 : 1;\n` +
    `    registraEstrellas(est);\n` +
    `  }, [cumplidosLab, totalLab, registraEstrellas]);\n`;
  const iFin = src.indexOf(mObj[1]) + mObj[1].length;
  src = src.slice(0, iFin) + bloque + src.slice(iFin);

  // 4 ── el render lee el enganche ────────────────────────────────────────
  src = src.replace(RE_RENDER, (b) => b.replace(/o\.done/g, "logrosLab[i]"));

  if (!dry) writeFileSync(archivo, crlf ? src.split("\n").join("\r\n") : src, "utf8");
  return { slug, ok: true };
}

function main() {
  const dry = process.argv.includes("--dry");
  const solo = process.argv.find((a) => a.startsWith("--solo="))?.slice(7);
  const objetivo = inventario().filter((f) => f.tresD && (!solo || f.slug === solo));

  console.log(`${objetivo.length} laboratorios 3D${dry ? " (dry)" : ""}\n`);
  let ok = 0, saltados = 0;
  const fallos: Resultado[] = [];
  for (const f of objetivo) {
    const r = cablearLogros(f.slug, f.archivo, dry);
    if (r.ok && r.motivo) saltados++;
    else if (r.ok) { ok++; console.log(`  ✓ ${f.slug}`); }
    else fallos.push(r);
  }
  console.log(`\n${ok} cableados, ${saltados} saltados, ${fallos.length} sin forma reconocible.`);
  for (const f of fallos.slice(0, 40)) console.log(`  · ${f.slug} — ${f.motivo}`);
}

if (process.argv[1] && process.argv[1].includes("aplicar-logros-labs")) main();
