/**
 * CONECTA LA PARTIDA (precisión + racha) A LOS LABORATORIOS DOM.
 *
 * Medido antes de tocar nada: en 43 de los 45 laboratorios DOM las estrellas
 * eran `(modoADone?1:0) + (modoBDone?1:0) + (modoCDone?1:0)`. Tres estrellas
 * por llegar al final, con cero coste por equivocarse. No había forma de
 * hacerlo mal, así que tampoco de hacerlo bien.
 *
 * El enganche es limpio porque los 45 definen los mismos tres ayudantes, con el
 * mismo texto byte a byte:
 *
 *     const sfxOk = () => sonido && audioRef.current?.correcto();
 *     const sfxNo = () => sonido && audioRef.current?.incorrecto();
 *     const sfxPlace = () => sonido && audioRef.current?.blip();
 *
 * `sfxPlace` se llama en cada colocación correcta y `sfxNo` en cada intento
 * fallido, así que basta con contar ahí: no hace falta encontrar los 315 sitios
 * donde se llaman. `sfxOk` se deja intacto —marca el fin de un modo, no una
 * respuesta— para no contar dos veces la última colocación.
 *
 * Las cuatro ediciones:
 *   1. importa `usePartida`/`MarcadorPartida` de `./_partida`
 *   2. `const partida = usePartida();` junto al estado de sonido
 *   3. los ayudantes registran acierto/error además de sonar
 *   4. `const estrellas = …` pasa por `partida.estrellasCon(modosHechos)`
 *   5. el marcador entra en la barra, antes del botón de teoría
 *
 * Idempotente: un archivo que ya importa `./_partida` se salta.
 *
 * Uso: npx tsx scripts/aplicar-partida-labs.ts [--dry] [--solo=slug]
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { inventario } from "./auditar-labs";

const LABS_DIR = resolve(process.cwd(), "src/components/practicas/labs");

const SFX_VIEJO = `  const sfxOk = () => sonido && audioRef.current?.correcto();
  const sfxNo = () => sonido && audioRef.current?.incorrecto();
  const sfxPlace = () => sonido && audioRef.current?.blip();`;

const SFX_NUEVO = `  // Los tres ayudantes son el único punto por el que pasan todos los aciertos
  // y todos los fallos del laboratorio, así que la partida se lleva aquí.
  // \`sfxOk\` no cuenta: marca el fin de un modo, no una respuesta suelta.
  const sfxOk = () => sonido && audioRef.current?.correcto();
  const sfxNo = () => {
    partida.error();
    return sonido && audioRef.current?.incorrecto();
  };
  const sfxPlace = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };`;

const RE_ESTRELLAS = /const estrellas = ((?:\(\w+ \? 1 : 0\)(?: \+ )?)+);/;

interface Resultado { slug: string; ok: boolean; motivo?: string }

export function cablearPartida(slug: string, componente: string, dry: boolean): Resultado {
  const archivo = resolve(LABS_DIR, `${componente}.tsx`);
  if (!existsSync(archivo)) return { slug, ok: false, motivo: "no existe el componente" };

  const original = readFileSync(archivo, "utf8");
  if (original.includes('from "./_partida"')) return { slug, ok: true, motivo: "ya estaba cableado" };

  const crlf = original.includes("\r\n");
  let src = crlf ? original.split("\r\n").join("\n") : original;

  const prefijo = src.match(/className="([a-z]+)-icobtn"/)?.[1];
  if (!prefijo) return { slug, ok: false, motivo: "no se pudo deducir el prefijo CSS" };

  // 1 ── import ───────────────────────────────────────────────────────────
  const anclaImport = 'import { LabSfx } from "./lab-audio";';
  if (!src.includes(anclaImport)) return { slug, ok: false, motivo: "sin import de LabSfx" };
  src = src.replace(anclaImport, `${anclaImport}\nimport { usePartida, MarcadorPartida } from "./_partida";`);

  // 2 ── estado de la partida ─────────────────────────────────────────────
  const anclaEstado = "  const [sonido, setSonido] = useState(false);";
  if (!src.includes(anclaEstado)) return { slug, ok: false, motivo: "sin estado de sonido" };
  src = src.replace(anclaEstado, `  const partida = usePartida();\n${anclaEstado}`);

  // 3 ── los ayudantes cuentan ────────────────────────────────────────────
  if (!src.includes(SFX_VIEJO)) return { slug, ok: false, motivo: "los ayudantes de sonido no tienen la forma esperada" };
  src = src.replace(SFX_VIEJO, SFX_NUEVO);

  // 4 ── las estrellas se ganan ───────────────────────────────────────────
  // Dos laboratorios (hardware-software y constructor-algoritmos) ya puntuaban
  // por aciertos a la primera, con su propia fórmula. Esos conservan la suya:
  // sólo reciben el marcador, que es lo que les faltaba para que el alumno vea
  // la racha mientras juega.
  let notaEstrellas: string | undefined;
  const mEstrellas = src.match(RE_ESTRELLAS);
  if (mEstrellas) {
    const sumandos = mEstrellas[1];
    const modos = (sumandos.match(/\?/g) ?? []).length;
    src = src.replace(
      RE_ESTRELLAS,
      `const modosHechos = ${sumandos};\n` +
        `  // Terminar los ${modos} modos vale 2★; la tercera se gana con precisión.\n` +
        `  const estrellas = partida.estrellasCon(modosHechos, ${modos});`
    );
  } else {
    notaEstrellas = "conserva su propia puntuación por aciertos a la primera";
  }

  // 5 ── marcador en la barra ─────────────────────────────────────────────
  const anclaBoton = `        <button className="${prefijo}-icobtn" data-on={drawer}`;
  const i = src.indexOf(anclaBoton);
  if (i < 0) return { slug, ok: false, motivo: "no se encontró el botón de teoría en la barra" };
  src =
    src.slice(0, i) +
    `        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />\n` +
    src.slice(i);

  if (!dry) writeFileSync(archivo, crlf ? src.split("\n").join("\r\n") : src, "utf8");
  return { slug, ok: true, motivo: notaEstrellas };
}

function main() {
  const dry = process.argv.includes("--dry");
  const solo = process.argv.find((a) => a.startsWith("--solo="))?.slice(7);

  const objetivo = inventario().filter((f) => !f.tresD && (!solo || f.slug === solo));
  console.log(`${objetivo.length} laboratorios DOM${dry ? " (dry)" : ""}\n`);

  let ok = 0;
  const fallos: Resultado[] = [];
  for (const f of objetivo) {
    const r = cablearPartida(f.slug, f.componente, dry);
    if (r.ok) { ok++; if (r.motivo) console.log(`  · ${f.slug} (${r.motivo})`); }
    else { fallos.push(r); console.log(`  ✗ ${f.slug} — ${r.motivo}`); }
  }
  console.log(`\n${ok} cableados, ${fallos.length} fallos.`);
  if (fallos.length) process.exitCode = 1;
}

if (process.argv[1] && process.argv[1].includes("aplicar-partida-labs")) main();
