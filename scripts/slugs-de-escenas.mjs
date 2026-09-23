#!/usr/bin/env node
/**
 * ¿QUÉ DIRECCIÓN ABRE ESTA ESCENA?
 *
 *     node scripts/slugs-de-escenas.mjs PhScene OndasScene
 *     node scripts/slugs-de-escenas.mjs --tocadas     las que git ve cambiadas
 *
 * Una escena 3D no tiene dirección propia: vive dentro de un laboratorio, y el
 * laboratorio es el que está registrado con un slug. Para ir a mirar lo que
 * acabo de cambiar hay que recorrer esa cadena — escena → Lab → slug — y a
 * mano son tres búsquedas por archivo.
 *
 * Se imprime un slug por línea, listo para pasárselo a `mirar-labs.mjs`.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const LABS = join(AQUI, '../src/components/practicas/labs');
const REGISTRY = join(AQUI, '../src/components/practicas/registry.tsx');

let escenas = process.argv.slice(2).filter((a) => !a.startsWith('--'));

if (process.argv.includes('--tocadas')) {
  /* `git diff --name-only` contra HEAD: lo que he cambiado y aún no he
   * confirmado, que es justo lo que hay que ir a mirar. */
  const salida = execSync('git diff --name-only HEAD -- "*Scene.tsx"', {
    cwd: join(AQUI, '../../..'),
    encoding: 'utf8',
  });
  escenas = salida
    .split('\n')
    .filter(Boolean)
    .map((l) => l.split('/').pop().replace('.tsx', ''));
}

if (!escenas.length) {
  console.error('uso: node scripts/slugs-de-escenas.mjs <Escena...> | --tocadas');
  process.exit(1);
}

const registro = readFileSync(REGISTRY, 'utf8');
const archivosLab = readdirSync(LABS).filter((f) => f.startsWith('Lab') && f.endsWith('.tsx'));

/** Qué Lab monta esta escena (por el import dinámico de su archivo). */
function labDe(escena) {
  for (const f of archivosLab) {
    const s = readFileSync(join(LABS, f), 'utf8');
    if (new RegExp(`["'./]+${escena}["']`).test(s)) return f.replace('.tsx', '');
  }
  return null;
}

/**
 * Con qué slug está registrado ese Lab.
 *
 * La clave va entrecomillada sólo cuando lleva guiones: `densidad:` a secas y
 * `"separacion-mezclas":` con comillas. Exigir las comillas dejaba fuera
 * justo los slugs de una sola palabra.
 */
function slugDe(lab) {
  const m = registro.match(new RegExp(`"?([a-z0-9-]+)"?:\\s*\\{[^}]*Component:\\s*${lab}\\s*\\}`));
  return m ? m[1] : null;
}

const slugs = [];
const huerfanas = [];
for (const e of escenas) {
  const lab = labDe(e);
  const slug = lab && slugDe(lab);
  if (slug) slugs.push(slug);
  else huerfanas.push(`${e}${lab ? ` (${lab}: sin slug)` : ' (ningun Lab la monta)'}`);
}

console.log([...new Set(slugs)].join('\n'));
if (huerfanas.length) console.error(`\n# sin resolver:\n# ${huerfanas.join('\n# ')}`);
