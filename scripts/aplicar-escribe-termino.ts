/**
 * CONVIERTE EL TERCER MODO REPETIDO EN «ESCRIBE EL TÉRMINO».
 *
 * Ocho laboratorios traían DOS modos idénticos en mecánica: emparejar concepto
 * con definición arrastrando, y a continuación emparejar término con definición
 * arrastrando. El segundo no pedía nada que el primero no hubiera pedido ya, y
 * el glosario entero está además en la ficha teórica de la práctica. Eso es
 * exactamente la «mecánica escueta» que había que rediseñar.
 *
 * Este codemod NO quita contenido: los mismos pares verbatim pasan a
 * `EscribeTermino` (`_mecanica-termino.tsx`), donde el alumno lee la definición
 * y su ejemplo y ESCRIBE el término. Recordar cuesta más que reconocer, y el
 * laboratorio deja de repetirse.
 *
 * Se apoya en que los ocho salieron del mismo molde: mismos nombres
 * (`empGlos`, `selGlos`, `shakeGlos`, `glosLibres`, `intentarGlos`,
 * `resetGlosario`, `RowsGlosario`) y misma forma de datos
 * (`{ id, termino, definicion, ejemplo }`). Cualquier archivo que se salga del
 * molde se reporta y se deja intacto — nunca a medias.
 *
 * Uso: npx tsx scripts/aplicar-escribe-termino.ts [--dry] [--solo=LabX]
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { resolve } from "path";

const LABS_DIR = resolve(process.cwd(), "src/components/practicas/labs");

/**
 * Fuera a propósito: en los laboratorios de inglés el «glosario» no son
 * términos sino ESTRUCTURAS («You should / shouldn't + infinitive», «When I
 * was..., I...», «What's the process for...?»). Pedir que se escriban letra a
 * letra no evalúa la gramática, evalúa la mecanografía: ahí emparejar es la
 * mecánica correcta y se queda.
 */
const EXCLUIDOS = new Set([
  "LabConsejosIngles",
  "LabPresentPerfectIngles",
  "LabProcesosIngles",
  "LabReglasIngles",
]);

/**
 * Todo laboratorio REGISTRADO que aún arrastre su glosario, salvo los
 * excluidos. Lo de «registrado» importa: `LabCrisisSociales.tsx` está en disco
 * pero no lo importa el registry, así que ningún alumno lo abre nunca; tocarlo
 * sería trabajar sobre código muerto.
 */
function objetivos(): string[] {
  const registry = readFileSync(resolve(process.cwd(), "src/components/practicas/registry.tsx"), "utf8");
  return readdirSync(LABS_DIR)
    .filter((f) => f.startsWith("Lab") && f.endsWith(".tsx"))
    .map((f) => f.slice(0, -4))
    .filter((n) => !EXCLUIDOS.has(n))
    .filter((n) => registry.includes(`"./labs/${n}"`))
    .filter((n) => readFileSync(resolve(LABS_DIR, `${n}.tsx`), "utf8").includes("const glosLibres = "))
    .sort();
}

interface Resultado { archivo: string; ok: boolean; motivo?: string; aviso?: string }

/** Corta desde `desde` hasta el primer `hasta` posterior, ambos incluidos. */
function tramo(src: string, desde: string, hasta: string): [number, number] | null {
  const i = src.indexOf(desde);
  if (i < 0) return null;
  const j = src.indexOf(hasta, i + desde.length);
  if (j < 0) return null;
  return [i, j + hasta.length];
}

export function convertir(nombre: string, dry: boolean): Resultado {
  const archivo = resolve(LABS_DIR, `${nombre}.tsx`);
  if (!existsSync(archivo)) return { archivo: nombre, ok: false, motivo: "no existe" };

  const original = readFileSync(archivo, "utf8");
  if (original.includes("_mecanica-termino")) return { archivo: nombre, ok: true, motivo: "ya estaba" };
  const crlf = original.includes("\r\n");
  let src = crlf ? original.split("\r\n").join("\n") : original;
  const avisos: string[] = [];
  let aviso: string | undefined;

  // ── de qué constante salen los pares ────────────────────────────────────
  const mDatos = src.match(/const glosLibres = (\w+)\.filter/);
  if (!mDatos || !mDatos[1]) return { archivo: nombre, ok: false, motivo: "no se ve el modo de glosario" };
  const DATOS = mDatos[1];

  // ── los dos primeros modos, para `persistMejor` ─────────────────────────
  const mA = src.match(/persistMejor\((\w+), true, glosarioDone\)/);
  const mB = src.match(/persistMejor\(true, (\w+), glosarioDone\)/);
  if (!mA?.[1] || !mB?.[1]) return { archivo: nombre, ok: false, motivo: "no se ven las llamadas a persistMejor" };
  const [primero, segundo] = [mA[1], mB[1]];

  // ── 1. import ───────────────────────────────────────────────────────────
  const anclaImport = 'import { CompletaTexto } from "./_mecanica-huecos";';
  if (!src.includes(anclaImport)) return { archivo: nombre, ok: false, motivo: "sin el import de CompletaTexto" };
  src = src.replace(anclaImport, `${anclaImport}\nimport { EscribeTermino } from "./_mecanica-termino";`);

  // ── 2. la etiqueta del modo ─────────────────────────────────────────────
  const mLabel = src.match(/\{ id: "glosario", label: "[^"]+", icono: "[^"]+" \},/);
  if (!mLabel) return { archivo: nombre, ok: false, motivo: "sin entrada de glosario en MODOS" };
  src = src.replace(mLabel[0], `{ id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },`);

  // ── 3. el estado: de cuatro variables de arrastre a dos ─────────────────
  const tEstado = tramo(
    src,
    "  const [empGlos, setEmpGlos] = useState<Record<string, boolean>>({});",
    "  const resetGlosario = () => {\n    setEmpGlos({});\n    setSelGlos(null);\n  };\n"
  );
  if (!tEstado) return { archivo: nombre, ok: false, motivo: "el estado del glosario no tiene la forma esperada" };
  const nuevoEstado =
    `  // El contador hace de \`key\`: subirlo remonta el componente y deja todas\n` +
    `  // las tarjetas en blanco.\n` +
    `  const [glosarioDone, setGlosarioDone] = useState(false);\n` +
    `  const [glosIntento, setGlosIntento] = useState(0);\n` +
    `  const resetGlosario = () => {\n` +
    `    setGlosarioDone(false);\n` +
    `    setGlosIntento((n) => n + 1);\n` +
    `  };\n`;
  src = src.slice(0, tEstado[0]) + nuevoEstado + src.slice(tEstado[1]);

  // El comentario del bloque anterior describía un arrastre.
  src = src.replace(
    /  \/\/ ── modo glosario \([^)]*\) ─*\n/,
    "  // ── modo glosario (lee la definición y ESCRIBE el término) ─────────────\n"
  );

  // ── 4. `glosarioDone` ya no se deriva: ahora es estado ──────────────────
  const derivado = new RegExp(`  const glosarioDone = Object\\.keys\\(empGlos\\)\\.length >= ${DATOS}\\.length;\\n`);
  if (!derivado.test(src)) return { archivo: nombre, ok: false, motivo: "no se encontró el `glosarioDone` derivado" };
  src = src.replace(derivado, "");

  // ── 5. el objetivo guiado ───────────────────────────────────────────────
  // El texto va entre comillas o entre acentos graves (un lab lo interpola), y
  // dice «los términos», «los conceptos» o «las estructuras» según el lab.
  const objetivo = /\{ txt: (["`])Empareja (los|las) ([^"`]+) del glosario\1, done: glosarioDone \}/;
  if (objetivo.test(src)) {
    src = src.replace(
      objetivo,
      (_m, comilla, art, resto) => `{ txt: ${comilla}Escribe ${art} ${resto} del glosario${comilla}, done: glosarioDone }`
    );
  } else if (/done: glosarioDone/.test(src)) {
    aviso = "el objetivo guiado sigue diciendo «empareja»";
  }

  // ── 6. el render ────────────────────────────────────────────────────────
  const tRender = tramo(src, '{modo === "glosario" && (', "\n          )}\n");
  if (!tRender) return { archivo: nombre, ok: false, motivo: "no se encontró el render del glosario" };
  const nuevoRender =
    `{modo === "glosario" && (\n` +
    `            <EscribeTermino\n` +
    `              key={glosIntento}\n` +
    `              pares={${DATOS}}\n` +
    `              accent={accent}\n` +
    `              rgba={color.rgba}\n` +
    `              completado={glosarioDone}\n` +
    `              instrucciones="Lee la definición y escribe el término del glosario que le corresponde."\n` +
    `              onCompletado={() => {\n` +
    `                setGlosarioDone(true);\n` +
    `                sfxOk();\n` +
    `                persistMejor(${primero}, ${segundo}, true);\n` +
    `              }}\n` +
    `              onAcierto={sfxPlace}\n` +
    `              onError={sfxNo}\n` +
    `            />\n` +
    `          )}\n`;
  src = src.slice(0, tRender[0]) + nuevoRender + src.slice(tRender[1]);

  // ── 7. la pista de la columna lateral ───────────────────────────────────
  const tPista = tramo(src, '{modo === "glosario" && (\n                <>', "</>\n              )}");
  if (!tPista) avisos.push("la pista lateral sigue describiendo el arrastre");
  if (tPista) {
    src =
      src.slice(0, tPista[0]) +
      `{modo === "glosario" && (\n` +
      `                <>Ya no se arrastra: lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.</>\n` +
      `              )}` +
      src.slice(tPista[1]);
  }

  // ── 8. fuera el componente de filas, que ya no se usa ───────────────────
  const iRows = src.indexOf("\nfunction RowsGlosario({");
  if (iRows < 0) return { archivo: nombre, ok: false, motivo: "no se encontró RowsGlosario" };
  const iFin = src.indexOf("\n}\n", iRows);
  if (iFin < 0) return { archivo: nombre, ok: false, motivo: "RowsGlosario sin cierre" };
  src = src.slice(0, iRows) + src.slice(iFin + 3);

  // ── 9. la cabecera del archivo, que describía el modo viejo ─────────────
  const cabecera = /«[^»]*» — arrastra cada (?:término|concepto) del glosario a su\n \*     definición verbatim \(([^)]+)\)\./;
  if (cabecera.test(src)) {
    src = src.replace(
      cabecera,
      (_m, fuente) =>
        `«Escribe el término» — lee la definición verbatim (${fuente}) y escribe\n` +
        ` *     de memoria el término del glosario que la nombra.`
    );
  } else {
    avisos.push("la cabecera del archivo sigue describiendo el arrastre");
  }

  if (!dry) writeFileSync(archivo, crlf ? src.split("\n").join("\r\n") : src, "utf8");
  if (aviso) avisos.push(aviso);
  return { archivo: nombre, ok: true, aviso: avisos.length ? avisos.join("; ") : undefined };
}

function main() {
  const dry = process.argv.includes("--dry");
  const solo = process.argv.find((a) => a.startsWith("--solo="))?.slice(7);
  const lista = objetivos().filter((n) => !solo || n === solo);

  let ok = 0;
  const avisos: Resultado[] = [];
  for (const n of lista) {
    const r = convertir(n, dry);
    if (r.ok) { ok++; console.log(`${dry ? "[dry] " : ""}✓ ${n}${r.motivo ? ` (${r.motivo})` : ""}`); }
    else console.log(`✗ ${n} — ${r.motivo}`);
    if (r.aviso) avisos.push(r);
  }
  console.log(`\n${ok}/${lista.length} convertidos${dry ? " (dry)" : ""}.`);
  for (const a of avisos) console.log(`  ⚠ ${a.archivo} — ${a.aviso}`);
  if (EXCLUIDOS.size) console.log(`  · fuera a propósito: ${[...EXCLUIDOS].join(", ")}`);
}

if (process.argv[1] && process.argv[1].includes("aplicar-escribe-termino")) main();
