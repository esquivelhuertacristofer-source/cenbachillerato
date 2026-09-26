#!/usr/bin/env node
/**
 * MARCA CADA ZONA DE DESTINO CON `data-zona`, PARA SIEMPRE.
 *
 *     node scripts/marcar-zonas.mjs [--dry]
 *
 * `data-sobre` solo existe mientras una ficha pasa por encima; para ilustrar la
 * zona en reposo (`_ilustrar-fichas.tsx`) hace falta una marca permanente. La
 * pone el `dropProps` de cada laboratorio, que es lo único que todas las zonas
 * tienen en común: se añade `"data-zona": "true"` justo antes del
 * `role: "button" as const` que ya devuelven.
 *
 * Solo el PRIMER `role:` después de `const dropProps`: otras partes del
 * archivo pueden tener el suyo.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'src/components/practicas/labs';
const dry = process.argv.includes('--dry');
let tocados = 0, ya = 0, sinRole = [];

for (const f of readdirSync(DIR).filter((x) => x.endsWith('.tsx'))) {
  const p = join(DIR, f);
  /* Copia de trabajo en CRLF y repo en LF: se opera en LF y se devuelve con
   * el final de línea que traía, o el archivo queda con finales mezclados. */
  const crudo = readFileSync(p, 'utf8');
  const eol = crudo.includes('\r\n') ? '\r\n' : '\n';
  const s = crudo.replace(/\r\n/g, '\n');
  const i = s.indexOf('const dropProps');
  if (i === -1) continue;
  if (s.indexOf('"data-zona"', i) !== -1) { ya++; continue; }
  /* El `role:` tiene que caer DENTRO del objeto de dropProps, no en cualquier
   * sitio de más abajo: se corta en su cierre `});`. */
  const cierre = s.indexOf('\n  });', i);
  const cuerpo = s.slice(i, cierre === -1 ? undefined : cierre);
  const m = /\n([ \t]*)role: "button" as const,/.exec(cuerpo);
  let nuevo;
  if (m) {
    const pos = i + m.index;
    nuevo = s.slice(0, pos) + `\n${m[1]}"data-zona": "true" as const,` + s.slice(pos);
  } else {
    /* Sin role: la marca va de primera propiedad, tras `=> ({`. */
    const ab = /=> \(\{\r?\n([ \t]*)/.exec(cuerpo);
    if (!ab) { sinRole.push(f); continue; }
    const pos = i + ab.index + ab[0].length;
    nuevo = s.slice(0, pos) + `"data-zona": "true" as const,\n${ab[1]}` + s.slice(pos);
  }
  if (!dry) writeFileSync(p, nuevo.replace(/\n/g, eol));
  tocados++;
}
console.log(`marcados: ${tocados} · ya estaban: ${ya} · con dropProps pero sin role (revisar a mano): ${sinRole.length}`);
for (const f of sinRole) console.log('   ' + f);
