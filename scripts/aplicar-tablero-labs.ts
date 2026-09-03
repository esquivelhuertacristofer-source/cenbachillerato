/**
 * DA IDENTIDAD VISUAL AL TABLERO DE LOS LABORATORIOS DOM.
 *
 * Medido antes: 44 de los 45 laboratorios DOM no dibujan ni una imagen ni un
 * SVG — son texto y un icono de FontAwesome. Peor: todas las cajas donde el
 * alumno suelta las fichas son idénticas entre sí, un gris sobre otro gris. El
 * tablero se lee como un formulario, no como un juego, y en un lab de cinco
 * categorías hay que releer la etiqueta cada vez para saber dónde estás.
 *
 * Esto añade CSS —nada de JSX, así que no toca la lógica de ninguna práctica—
 * al bloque `<style>` que ya tiene cada laboratorio:
 *
 *  · cada caja de destino recibe un tono propio por su posición (una franja de
 *    color arriba y un lavado suave de fondo), así que las categorías se
 *    distinguen de un vistazo y el tablero tiene ritmo;
 *  · el tono se refuerza cuando la caja queda completa;
 *  · las fichas se levantan al pasar el ratón y al quedar seleccionadas.
 *
 * El color es identidad, no información: la etiqueta de cada caja sigue
 * diciendo qué es, así que nadie depende del color para jugar.
 *
 * Va al final del bloque `<style>` a propósito: las reglas que ya existen tienen
 * la misma especificidad, y la última gana.
 *
 * Idempotente: un archivo que ya tiene el bloque se salta.
 *
 * Uso: npx tsx scripts/aplicar-tablero-labs.ts [--dry] [--solo=slug]
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { inventario } from "./auditar-labs";

const LABS_DIR = resolve(process.cwd(), "src/components/practicas/labs");

const MARCA = "/* Identidad del tablero */";

/** Seis tonos que conviven en el fondo azul oscuro de la plataforma. */
const TONOS = [188, 262, 44, 152, 330, 18];

function cssTablero(p: string, src: string): string {
  const hayBin = src.includes(`.${p}-bin`);
  const hayRow = src.includes(`.${p}-row`);
  const destinos = [hayBin ? `.${p}-bin` : "", hayRow ? `.${p}-row` : ""].filter(Boolean).join(", ");
  if (!destinos) return "";

  const rampa = TONOS.map(
    (t, i) =>
      `        ${destinos.split(", ").map((d) => `${d}:nth-of-type(${TONOS.length}n+${i + 1})`).join(", ")} { --tono:${t}; }`
  ).join("\n");

  // Sin `overflow:hidden`: una caja con muchas fichas recortaría su contenido.
  // La franja se mete 10px por lado, así que nunca sobresale de las esquinas
  // redondeadas y no hace falta recortar nada.
  return `
        ${MARCA}
        ${destinos} { --tono:188; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
${rampa}
        ${destinos.split(", ").map((d) => `${d}::before`).join(", ")} { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        ${destinos.split(", ").map((d) => `${d}[data-done="true"]`).join(", ")} {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .${p}-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
        .${p}-chip:hover { transform:translateY(-2px); }
        .${p}-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        @media (prefers-reduced-motion: reduce){
          .${p}-chip, .${p}-chip:hover, .${p}-chip[data-sel="true"] { transform:none; transition:none; }
        }
`;
}

interface Resultado { slug: string; ok: boolean; motivo?: string }

export function cablearTablero(slug: string, componente: string, dry: boolean): Resultado {
  const archivo = resolve(LABS_DIR, `${componente}.tsx`);
  if (!existsSync(archivo)) return { slug, ok: false, motivo: "no existe el componente" };

  const original = readFileSync(archivo, "utf8");
  if (original.includes(MARCA)) return { slug, ok: true, motivo: "ya estaba" };

  const crlf = original.includes("\r\n");
  let src = crlf ? original.split("\r\n").join("\n") : original;

  const p = src.match(/className="([a-z]+)-icobtn"/)?.[1];
  if (!p) return { slug, ok: false, motivo: "no se pudo deducir el prefijo CSS" };

  const css = cssTablero(p, src);
  if (!css) return { slug, ok: false, motivo: "no tiene cajas de destino (-bin/-row)" };

  const cierre = "      `}</style>";
  if (!src.includes(cierre)) return { slug, ok: false, motivo: "no se encontró el cierre del <style>" };
  src = src.replace(cierre, `${css}${cierre}`);

  if (!dry) writeFileSync(archivo, crlf ? src.split("\n").join("\r\n") : src, "utf8");
  return { slug, ok: true };
}

function main() {
  const dry = process.argv.includes("--dry");
  const solo = process.argv.find((a) => a.startsWith("--solo="))?.slice(7);
  const objetivo = inventario().filter((f) => !f.tresD && (!solo || f.slug === solo));

  console.log(`${objetivo.length} laboratorios DOM${dry ? " (dry)" : ""}\n`);
  let ok = 0;
  const fallos: Resultado[] = [];
  for (const f of objetivo) {
    const r = cablearTablero(f.slug, f.componente, dry);
    if (r.ok) { ok++; if (r.motivo) console.log(`  · ${f.slug} (${r.motivo})`); }
    else { fallos.push(r); console.log(`  ✗ ${f.slug} — ${r.motivo}`); }
  }
  console.log(`\n${ok} con identidad de tablero, ${fallos.length} fallos.`);
  if (fallos.length) process.exitCode = 1;
}

if (process.argv[1] && process.argv[1].includes("aplicar-tablero-labs")) main();
