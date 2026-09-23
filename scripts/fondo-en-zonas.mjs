#!/usr/bin/env node
/**
 * LA ILUSTRACIÓN DE FONDO, DENTRO DE LA ZONA DE DESTINO.
 *
 *     node scripts/fondo-en-zonas.mjs [--seco]
 *
 * Las cubetas de clasificar miden 230 px de alto y arrancan con un título, una
 * línea y un «Arrastra aquí…». El resto es rectángulo oscuro: el mayor hueco
 * muerto de la pantalla y lo primero que se ve al abrir el laboratorio. Este
 * codemod mete ahí `<FondoTermino>` con la ilustración del concepto.
 *
 * CÓMO ENCUENTRA LA CAJA. No por el nombre de la clase —es distinto en cada
 * laboratorio: `fal-bin`, `seg-bin`, `nav-bin`…— sino por `{...dropProps(`,
 * que es exactamente lo que convierte un div en zona de destino y no aparece
 * en ningún otro sitio. Desde ahí se retrocede hasta la etiqueta de apertura
 * y se avanza hasta su `>`.
 *
 * DE DÓNDE SACA EL TÉRMINO. Del `<VinetaTermino termino={X.Y}>` que la ola
 * anterior ya puso en la cabecera de esa misma caja. Si la caja no tiene
 * cabecera con viñeta, no hay término que dibujar y se deja como está: no se
 * inventa.
 *
 * POR QUÉ TOCA EL `style` DE LA CAJA. `position: relative` para que la marca
 * se ancle a la caja, e `isolation: isolate` para crear contexto de
 * apilamiento: sin él, el `z-index: -1` de la marca la mandaría por DETRÁS del
 * fondo de la propia caja y no se vería nada. Las dos son neutras para la
 * maquetación —`relative` sin desplazamiento no mueve nada— y muchas cajas ya
 * traían `relative` de la campaña del color del tablero.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const LABS = join(dirname(fileURLToPath(import.meta.url)), '../src/components/practicas/labs');
const SECO = process.argv.includes('--seco');

/** El `>` que cierra una etiqueta de apertura, saltando llaves y cadenas. */
function finDeEtiqueta(s, desde) {
  let prof = 0;
  for (let k = desde; k < s.length; k++) {
    const c = s[k];
    if (c === '{') prof++;
    else if (c === '}') prof--;
    else if (c === '"' || c === "'" || c === '`') {
      const cierre = c;
      k++;
      while (k < s.length && s[k] !== cierre) k += s[k] === '\\' ? 2 : 1;
    } else if (c === '>' && prof === 0) return k;
  }
  return -1;
}

const tocados = [];
let total = 0;
const sinTermino = [];

for (const nombre of readdirSync(LABS).filter((f) => /^Lab.*\.tsx$/.test(f))) {
  const ruta = join(LABS, nombre);
  let s = readFileSync(ruta, 'utf8').replace(/\r\n/g, '\n');
  if (s.includes('FondoTermino')) continue; // idempotente
  if (!s.includes('VinetaTermino')) continue; // sin cabecera ilustrada no hay término

  /* De atrás hacia delante: cada inserción desplaza el texto, y empezando por
   * el final los índices de los anteriores siguen siendo válidos. */
  const sitios = [...s.matchAll(/\{\.\.\.dropProps\(/g)].map((m) => m.index).reverse();
  let n = 0;

  for (const idx of sitios) {
    const abre = s.lastIndexOf('<', idx);
    if (abre < 0) continue;
    const cierre = finDeEtiqueta(s, abre);
    if (cierre < 0) continue;

    /* El término sale de la viñeta de la cabecera, que está dentro de esta
     * misma caja. Se mira solo el trozo que sigue, no el archivo entero. */
    const cuerpo = s.slice(cierre, cierre + 1400);
    const vin = cuerpo.match(/<VinetaTermino termino=\{([^}]+)\}/);
    if (!vin) { sinTermino.push(nombre); continue; }

    const etiqueta = s.slice(abre, cierre);
    let nuevaEtiqueta = etiqueta;
    if (/\bstyle=\{\{/.test(etiqueta)) {
      /* Delante de lo que ya haya: si la caja ya declaraba `position`, la suya
       * manda y esto no la pisa. */
      nuevaEtiqueta = etiqueta.replace(/\bstyle=\{\{\s*/, 'style={{ position: "relative", isolation: "isolate", ');
    } else {
      nuevaEtiqueta = etiqueta.replace(/\{\.\.\.dropProps\(/, 'style={{ position: "relative", isolation: "isolate" }}\n            {...dropProps(');
    }

    s =
      s.slice(0, abre) +
      nuevaEtiqueta +
      s.slice(cierre, cierre + 1) +
      `\n            {/* La ilustración del concepto llenando la caja vacía. */}` +
      `\n            <FondoTermino termino={${vin[1]}} />` +
      s.slice(cierre + 1);
    n++;
  }

  if (!n) continue;
  s = s.replace('import { VinetaTermino } from "./_vineta";', 'import { FondoTermino, VinetaTermino } from "./_vineta";');
  if (!SECO) writeFileSync(ruta, s, 'utf8');
  tocados.push(`${nombre.replace('.tsx', '')}:${n}`);
  total += n;
}

console.log(`${SECO ? '[seco] ' : ''}${tocados.length} laboratorios · ${total} zonas`);
if (sinTermino.length) console.log(`zonas sin cabecera ilustrada, no tocadas: ${[...new Set(sinTermino)].length} laboratorios`);
console.log(tocados.join(' '));
