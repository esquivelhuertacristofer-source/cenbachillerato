/**
 * AÑADE EL MODO «COMPLETA EL TEXTO» A LOS LABORATORIOS DOM.
 *
 * De los 135 modos que tienen los 45 laboratorios DOM, 43 son «clasifica en
 * cubetas» y 36 «empareja término y definición»; 22 laboratorios repiten
 * mecánica dentro de sí mismos. Este codemod les mete un modo que NO es
 * arrastrar una etiqueta: un párrafo real de la progresión, con huecos, que el
 * alumno completa escribiendo. Producción en vez de reconocimiento, y con el
 * contexto entero delante.
 *
 * Las siete ediciones:
 *   1. importa `CompletaTexto` y los datos de `{slug}-huecos`
 *   2. amplía `type Modo` con `"texto"`
 *   3. añade la entrada a `MODOS`
 *   4. añade el estado del modo (hecho + contador para reiniciar)
 *   5. añade la función de reinicio y la enchufa a `resetActual`
 *   6. renderiza el modo
 *   7. cuenta el modo nuevo para las estrellas (pasan a ser cuatro modos)
 *
 * Se AÑADE en vez de sustituir al modo de glosario repetido: quitar un modo
 * obliga a arrancar su estado, sus manejadores y su render de cada archivo, y
 * eso ya no es un reemplazo de texto sino una reescritura por laboratorio.
 * Queda reportado como pendiente.
 *
 * Idempotente. Uso: npx tsx scripts/aplicar-huecos-labs.ts [--dry] [--solo=slug]
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { inventario } from "./auditar-labs";
import { nombreHuecos } from "./generar-huecos-labs";

const LABS_DIR = resolve(process.cwd(), "src/components/practicas/labs");

interface Resultado { slug: string; ok: boolean; motivo?: string; aviso?: string }

export function cablearHuecos(slug: string, archivoRel: string, dry: boolean): Resultado {
  const archivo = resolve(process.cwd(), archivoRel);
  if (!existsSync(archivo)) return { slug, ok: false, motivo: `no existe ${archivoRel}` };
  if (!existsSync(resolve(LABS_DIR, `${slug}-huecos.ts`))) {
    return { slug, ok: false, motivo: `falta ${slug}-huecos.ts` };
  }

  const original = readFileSync(archivo, "utf8");
  if (original.includes('from "./_mecanica-huecos"')) return { slug, ok: true, motivo: "ya estaba" };

  const crlf = original.includes("\r\n");
  let src = crlf ? original.split("\r\n").join("\n") : original;
  const CONST = nombreHuecos(slug);
  let aviso: string | undefined;

  // 1 ── imports ──────────────────────────────────────────────────────────
  const anclaImport = 'import { LabSfx } from "./lab-audio";';
  if (!src.includes(anclaImport)) return { slug, ok: false, motivo: "sin import de LabSfx" };
  src = src.replace(
    anclaImport,
    `${anclaImport}\nimport { CompletaTexto } from "./_mecanica-huecos";\nimport { ${CONST} } from "./${slug}-huecos";`
  );

  // 2 ── el tipo del modo ─────────────────────────────────────────────────
  const mTipo = src.match(/type Modo = ([^;]+);/);
  if (!mTipo) return { slug, ok: false, motivo: "sin `type Modo`" };
  src = src.replace(mTipo[0], `type Modo = ${mTipo[1]} | "texto";`);

  // 3 ── la entrada en MODOS ──────────────────────────────────────────────
  const iModos = src.indexOf("const MODOS: { id: Modo; label: string; icono: string }[] = [");
  if (iModos < 0) return { slug, ok: false, motivo: "sin arreglo MODOS" };
  const iCierre = src.indexOf("\n];", iModos);
  if (iCierre < 0) return { slug, ok: false, motivo: "no se encontró el cierre de MODOS" };
  src =
    src.slice(0, iCierre) +
    `\n  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },` +
    src.slice(iCierre);

  // 4 ── estado ───────────────────────────────────────────────────────────
  const anclaEstado = "  const [drawer, setDrawer] = useState(false);";
  if (!src.includes(anclaEstado)) return { slug, ok: false, motivo: "sin estado del cajón de teoría" };
  src = src.replace(
    anclaEstado,
    `${anclaEstado}\n` +
      `  // Modo «Completa el texto». El contador sirve de \`key\`: subirlo remonta\n` +
      `  // el componente y devuelve todos los huecos en blanco.\n` +
      `  const [textoDone, setTextoDone] = useState(false);\n` +
      `  const [textoIntento, setTextoIntento] = useState(0);`
  );

  // 5 ── reinicio ─────────────────────────────────────────────────────────
  const mReset = src.match(/\n(  const resetActual = )([^;]+);/);
  if (mReset) {
    src = src.replace(
      mReset[0],
      `\n  const resetTexto = () => {\n` +
        `    setTextoDone(false);\n` +
        `    setTextoIntento((n) => n + 1);\n` +
        `  };\n` +
        `${mReset[1]}modo === "texto" ? resetTexto : ${mReset[2]};`
    );
  } else {
    aviso = "sin `resetActual`: el botón de reiniciar no alcanza al modo nuevo";
  }

  // 6 ── render, como primer bloque de la columna principal ───────────────
  const iRender = src.indexOf('\n          {modo === "');
  if (iRender < 0) return { slug, ok: false, motivo: "no se encontró el render de los modos" };
  const bloque =
    `\n          {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}\n` +
    `          {modo === "texto" && (\n` +
    `            <CompletaTexto\n` +
    `              key={textoIntento}\n` +
    `              data={${CONST}}\n` +
    `              accent={accent}\n` +
    `              rgba={color.rgba}\n` +
    `              completado={textoDone}\n` +
    `              onCompletado={() => {\n` +
    `                setTextoDone(true);\n` +
    `                sfxOk();\n` +
    `              }}\n` +
    `              onAcierto={sfxPlace}\n` +
    `              onError={sfxNo}\n` +
    `            />\n` +
    `          )}\n`;
  src = src.slice(0, iRender) + bloque + src.slice(iRender);

  // 7 ── el modo cuenta para las estrellas ────────────────────────────────
  const mHechos = src.match(/const modosHechos = ([^;]+);/);
  if (mHechos) {
    src = src.replace(mHechos[0], `const modosHechos = ${mHechos[1]} + (textoDone ? 1 : 0);`);
    src = src.replace(/partida\.estrellasCon\(modosHechos, (\d+)\)/, (_m, n) =>
      `partida.estrellasCon(modosHechos, ${Number(n) + 1})`
    );
  } else {
    aviso = [aviso, "sin `modosHechos`: conserva su propia puntuación"].filter(Boolean).join("; ");
  }

  if (!dry) writeFileSync(archivo, crlf ? src.split("\n").join("\r\n") : src, "utf8");
  return { slug, ok: true, aviso };
}

function main() {
  const dry = process.argv.includes("--dry");
  const solo = process.argv.find((a) => a.startsWith("--solo="))?.slice(7);
  const objetivo = inventario().filter((f) => !f.tresD && (!solo || f.slug === solo));

  console.log(`${objetivo.length} laboratorios DOM${dry ? " (dry)" : ""}\n`);
  let ok = 0;
  const fallos: Resultado[] = [];
  const avisos: Resultado[] = [];
  for (const f of objetivo) {
    const r = cablearHuecos(f.slug, f.archivo, dry);
    if (!r.ok) { fallos.push(r); continue; }
    ok++;
    if (r.aviso) avisos.push(r);
  }
  console.log(`${ok} con el modo nuevo, ${fallos.length} fuera.`);
  for (const f of fallos) console.log(`  ✗ ${f.slug} — ${f.motivo}`);
  for (const a of avisos) console.log(`  ⚠ ${a.slug} — ${a.aviso}`);
}

if (process.argv[1] && process.argv[1].includes("aplicar-huecos-labs")) main();
