/**
 * MIGRA LOS LABORATORIOS AL HOOK `useEstrellas`.
 *
 * El defecto que arregla: 58 laboratorios ESCRIBEN la mejor marca de estrellas
 * en `valoraciones_lab` (`guardarEstrellas`) pero ninguno la LEE de vuelta. Cada
 * uno reimplementa la persistencia con `useState` + `localStorage`, así que el
 * alumno que gana 3★ en la computadora de la escuela abre el mismo laboratorio
 * en su teléfono y ve cero. El dato está en la base y nadie lo consulta.
 *
 * `src/lib/hooks/useEstrellas.ts` ya resolvía esto —inicializa de localStorage,
 * hidrata desde la base tomando el MAX y persiste en las dos— pero no lo
 * importaba ningún laboratorio. Este codemod hace la sustitución:
 *
 *   const [mejor, setMejor] = useState<number>(() => { …localStorage… });
 *      → const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
 *
 *   setMejor((m) => { …localStorage… });  void guardarEstrellas(RETO_KEY, est);
 *      → registraEstrellas(est);
 *
 * Queda fuera `LabSeparacionMezclas`: guarda un registro por mezcla en
 * localStorage y un escalar en la base, y fundir las dos formas no es un
 * reemplazo de texto. Se reporta al final.
 *
 * Uso: npx tsx scripts/migrar-estrellas-labs.ts [--dry] [--solo=LabX]
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { resolve } from "path";

const LABS_DIR = resolve(process.cwd(), "src/components/practicas/labs");

/** Forma distinta de guardar: se migra a mano, no con este codemod. */
const EXCLUIDOS = new Set(["LabSeparacionMezclas.tsx"]);

const RE_INIT =
  /[ \t]*const \[(mejor|mejorEstrellas), set(?:Mejor|MejorEstrellas)\] = useState<number>\(\(\) => \{[\s\S]*?\n[ \t]*\}\);\n/;
// El callback se llama `m` en unos labs y `prev` en otros; el cuerpo es el
// mismo MAX + escritura en localStorage en los dos casos.
const RE_PERSIST = /[ \t]*set(?:Mejor|MejorEstrellas)\(\((?:m|prev)\) => \{[\s\S]*?\n[ \t]*\}\);\n/;
const RE_GUARDAR = /[ \t]*void guardarEstrellas\(RETO_KEY, (\w+)\);/;
const RE_IMPORT = /import \{ guardarEstrellas \} from "@\/app\/actions\/guardarEstrellas";\n/;

export interface ResultadoMigracion {
  archivo: string;
  ok: boolean;
  motivo?: string;
}

export function migrar(archivo: string, dry: boolean): ResultadoMigracion {
  const ruta = resolve(LABS_DIR, archivo);
  const original = readFileSync(ruta, "utf8");
  if (original.includes("useEstrellas")) return { archivo, ok: true, motivo: "ya migrado" };
  if (!original.includes("guardarEstrellas")) return { archivo, ok: true, motivo: "no guarda estrellas" };

  const crlf = original.includes("\r\n");
  let src = crlf ? original.split("\r\n").join("\n") : original;

  // 1 ── el estado local pasa a ser el hook ───────────────────────────────
  const mInit = src.match(RE_INIT);
  if (!mInit) return { archivo, ok: false, motivo: "no se reconoció el estado de la mejor marca" };
  const nombre = mInit[1];
  const destructura =
    nombre === "mejorEstrellas"
      ? "  const { mejorEstrellas, registraEstrellas } = useEstrellas(RETO_KEY);\n"
      : `  const { mejorEstrellas: ${nombre}, registraEstrellas } = useEstrellas(RETO_KEY);\n`;
  src = src.replace(RE_INIT, destructura);

  // 2 ── la escritura en la base pasa a ser el registro del hook ──────────
  const mGuardar = src.match(RE_GUARDAR);
  if (!mGuardar) return { archivo, ok: false, motivo: "no se encontró la llamada a guardarEstrellas" };
  const variable = mGuardar[1];
  if (!RE_PERSIST.test(src)) return { archivo, ok: false, motivo: "no se reconoció el bloque de persistencia" };
  src = src.replace(RE_PERSIST, "");
  src = src.replace(RE_GUARDAR, `    registraEstrellas(${variable});`);

  // 3 ── imports ──────────────────────────────────────────────────────────
  if (!RE_IMPORT.test(src)) return { archivo, ok: false, motivo: "no se encontró el import de guardarEstrellas" };
  src = src.replace(RE_IMPORT, 'import { useEstrellas } from "@/lib/hooks/useEstrellas";\n');

  if (src.includes("guardarEstrellas")) {
    return { archivo, ok: false, motivo: "quedaron referencias a guardarEstrellas" };
  }

  if (!dry) writeFileSync(ruta, crlf ? src.split("\n").join("\r\n") : src, "utf8");
  return { archivo, ok: true };
}

function main() {
  const dry = process.argv.includes("--dry");
  const solo = process.argv.find((a) => a.startsWith("--solo="))?.slice(7);

  const candidatos = readdirSync(LABS_DIR)
    .filter((f) => f.startsWith("Lab") && f.endsWith(".tsx"))
    .filter((f) => readFileSync(resolve(LABS_DIR, f), "utf8").includes("guardarEstrellas"))
    .filter((f) => !EXCLUIDOS.has(f))
    .filter((f) => !solo || f === `${solo}.tsx` || f === solo);

  console.log(`${candidatos.length} laboratorios por migrar${dry ? " (dry)" : ""}\n`);
  let ok = 0;
  const fallos: ResultadoMigracion[] = [];
  for (const f of candidatos) {
    const r = migrar(f, dry);
    if (r.ok) { ok++; if (r.motivo) console.log(`  · ${f} (${r.motivo})`); }
    else { fallos.push(r); console.log(`  ✗ ${f} — ${r.motivo}`); }
  }
  console.log(`\n${ok} migrados, ${fallos.length} fallos.`);
  if (!solo) console.log(`Fuera del codemod (forma distinta): ${[...EXCLUIDOS].join(", ")}`);
  if (fallos.length) process.exitCode = 1;
}

if (process.argv[1] && process.argv[1].includes("migrar-estrellas-labs")) main();
