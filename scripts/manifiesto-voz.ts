/**
 * ESCRIBE `src/lib/voz/voz-hecha.ts`: qué actividades se pueden escuchar.
 *
 * Portado de `scripts/manifiesto-voz.mjs` de la plataforma de robótica, con su
 * regla intacta: UNA ACTIVIDAD ENTRA SÓLO SI TIENE TODOS SUS CLIPS. Media
 * lectura con voz es un botón "Escuchar" que se calla a mitad del texto delante
 * del grupo, y eso es peor que no ofrecerlo.
 *
 * Compara lo que pidió el extractor (`scripts/out/voz-actividades.json`) contra
 * lo que de veras hay grabado en `../video-pipeline/voz-out/`.
 *
 * Uso: npx tsx scripts/manifiesto-voz.ts
 */
import { resolve } from "path";
import { existsSync, readFileSync, writeFileSync, statSync } from "fs";

const FUENTE = resolve(process.cwd(), "scripts/out/voz-actividades.json");
const GRABADO = resolve(process.cwd(), "../video-pipeline/voz-out");
const DESTINO = resolve(process.cwd(), "src/lib/voz/voz-hecha.ts");

/** Un MP3 más chico que esto es un clip vacío, no una narración. */
const MINIMO_BYTES = 900;

interface Fila { codigo: string; clave: string; texto: string }

function main() {
  const filas: Fila[] = JSON.parse(readFileSync(FUENTE, "utf8"));

  const porActividad = new Map<string, string[]>();
  for (const f of filas) {
    const lista = porActividad.get(f.codigo) ?? [];
    lista.push(f.clave);
    porActividad.set(f.codigo, lista);
  }

  const completas: string[] = [];
  const incompletas: Array<{ codigo: string; faltan: number; de: number }> = [];
  for (const [codigo, claves] of porActividad) {
    const faltan = claves.filter((c) => {
      const p = resolve(GRABADO, codigo, `${c}.mp3`);
      return !existsSync(p) || statSync(p).size < MINIMO_BYTES;
    });
    if (faltan.length === 0) completas.push(codigo);
    else incompletas.push({ codigo, faltan: faltan.length, de: claves.length });
  }
  completas.sort();

  const cuerpo = `/**
 * GENERADO POR \`scripts/manifiesto-voz.ts\`. No editar a mano.
 *
 * Las actividades que ya tienen su lectura grabada con la voz de la plataforma
 * (\`es-MX-DaliaNeural\`, la misma de los 211 videos). Una actividad entra aquí
 * sólo si tiene TODOS sus clips: media lectura con voz es un botón que se calla
 * a mitad del texto delante del grupo.
 *
 * Las que NO están aquí conservan el narrador del navegador (Web Speech API),
 * así que el botón "Escuchar" nunca desaparece — sólo mejora donde hay grabación.
 */

const CON_VOZ: ReadonlySet<string> = new Set([
${completas.map((c) => `  ${JSON.stringify(c)},`).join("\n")}
]);

/** ¿Esta actividad se puede escuchar con la voz grabada? */
export function tieneVozGrabada(codigo: string | null | undefined): boolean {
  return codigo != null && CON_VOZ.has(codigo);
}

/** Cuántas actividades se pueden escuchar. Para reportes de cobertura. */
export const ACTIVIDADES_CON_VOZ = CON_VOZ.size;
`;

  writeFileSync(DESTINO, cuerpo, "utf8");
  console.log(
    `voz-hecha.ts: ${completas.length} actividades completas de ${porActividad.size}` +
    (incompletas.length ? ` (${incompletas.length} incompletas, quedan con narrador del navegador)` : "")
  );
  for (const i of incompletas.slice(0, 15)) {
    console.log(`  incompleta ${i.codigo}: faltan ${i.faltan} de ${i.de}`);
  }
}

main();
