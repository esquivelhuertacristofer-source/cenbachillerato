/**
 * ESCRIBE `src/components/practicas/labs/voz-labs.generated.ts`: qué frases de
 * los laboratorios se pueden oír con la voz grabada.
 *
 * Hermano de `scripts/manifiesto-voz.ts`, con una diferencia en la regla.
 *
 * ALLÁ LA UNIDAD ES LA ACTIVIDAD Y ENTRA ENTERA O NO ENTRA: media lectura con
 * voz es un botón «Escuchar» que se calla a mitad del texto delante del grupo.
 * AQUÍ LA UNIDAD ES LA FRASE. Cada botón de un laboratorio dice una frase
 * completa y sola; que «Good morning» esté grabada y «Work in pairs» no, no
 * parte nada por la mitad, y quedarse sin grabar una sola frase de un lab no
 * puede condenar a las otras treinta a la SAPI vieja de Windows. La regla
 * equivalente —«una unidad entra sólo si tiene TODOS sus clips»— se aplica
 * entonces a la frase: entra sólo si su MP3 existe y no está vacío.
 *
 * Compara lo que pidió el extractor (`data/voz-labs.json`) contra lo que de
 * veras hay grabado en `public/media/voz-labs/`.
 *
 * Uso: npx tsx scripts/manifiesto-voz-labs.ts
 */
import { resolve, join } from "path";
import { existsSync, readFileSync, writeFileSync, statSync } from "fs";

const FUENTE = resolve(process.cwd(), "data/voz-labs.json");
const GRABADO = resolve(process.cwd(), "public/media/voz-labs");
const DESTINO = resolve(process.cwd(), "src/components/practicas/labs/voz-labs.generated.ts");

/** Un MP3 más chico que esto es un clip vacío, no una grabación. */
const MINIMO_BYTES = 900;

interface Fila {
  idioma: string;
  clave: string;
  texto: string;
  labs: string[];
}

function main() {
  const filas: Fila[] = JSON.parse(readFileSync(FUENTE, "utf8"));

  const hechas: string[] = [];
  const faltan: Fila[] = [];
  let bytes = 0;
  for (const f of filas) {
    const p = join(GRABADO, ...f.clave.split("/")) + ".mp3";
    if (existsSync(p) && statSync(p).size >= MINIMO_BYTES) {
      hechas.push(f.clave);
      bytes += statSync(p).size;
    } else {
      faltan.push(f);
    }
  }
  hechas.sort();

  const conClip = new Set(hechas);
  const porLab = new Map<string, { hechas: number; total: number }>();
  for (const f of filas) {
    const ok = conClip.has(f.clave);
    for (const l of f.labs) {
      const c = porLab.get(l) ?? { hechas: 0, total: 0 };
      c.total += 1;
      if (ok) c.hechas += 1;
      porLab.set(l, c);
    }
  }

  const cuerpo = `/**
 * GENERADO POR \`scripts/manifiesto-voz-labs.ts\`. No editar a mano.
 *
 * Las frases de los laboratorios que ya tienen clip grabado con la voz de la
 * plataforma: \`en-US-AvaNeural\` para el inglés y \`es-MX-DaliaNeural\` para
 * \`lectura-en-voz-alta\`, que es el único en español.
 *
 * Esto existe para que \`lab-voz.ts\` pueda saber SI HAY CLIP sin preguntarle al
 * servidor. El botón «Escuchar» tiene que decidir en el mismo tic en que se
 * pulsa; sin este índice, cada frase sin grabar costaría un 404 y una espera
 * antes de caer a la voz del navegador.
 *
 * Las frases que NO están aquí conservan el narrador del navegador (Web Speech
 * API), así que el botón «Escuchar» nunca se queda mudo — sólo mejora donde hay
 * grabación.
 */

/** Claves \`<idioma>/<hash>-<largo>\`, las que arma \`claveDeVozLab()\`. */
export const VOZ_LABS_GRABADA: ReadonlySet<string> = new Set([
${hechas.map((c) => `  ${JSON.stringify(c)},`).join("\n")}
]);

/** Cuántas frases se pueden oír grabadas. Para reportes de cobertura. */
export const FRASES_CON_VOZ = VOZ_LABS_GRABADA.size;
`;

  writeFileSync(DESTINO, cuerpo, "utf8");

  console.log(
    `voz-labs.generated.ts: ${hechas.length} frases grabadas de ${filas.length}` +
      ` · ${(bytes / 1048576).toFixed(2)} MB en disco`
  );
  for (const [lab, c] of [...porLab.entries()].sort()) {
    const marca = c.hechas === c.total ? "✓" : "·";
    console.log(`  ${marca} ${lab.padEnd(38)} ${c.hechas}/${c.total}`);
  }
  for (const f of faltan.slice(0, 15)) {
    console.log(`  SIN CLIP ${f.clave}  ${JSON.stringify(f.texto).slice(0, 70)}`);
  }
}

main();
