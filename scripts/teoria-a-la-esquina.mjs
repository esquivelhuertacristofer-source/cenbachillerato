#!/usr/bin/env node
/**
 * EL BOTÓN DE TEORÍA, FUERA DEL TEXTO.
 *
 *     node scripts/teoria-a-la-esquina.mjs [--seco]
 *
 * POR QUÉ. El botón flotante de Teoría estaba en `bottom:16px; left:50%`, y
 * justo ahí abajo, centrada, va la cinta de narración del laboratorio. El
 * resultado se ve en cualquier captura: la píldora TAPA PALABRAS del renglón
 * que el alumno tiene que leer. No es un defecto de una escena, es el mismo
 * bloque de CSS copiado en 83 archivos.
 *
 * QUÉ HACE. Lo lleva a `bottom:16px; right:16px`, que NO es una invención:
 * es lo que ya hacen los laboratorios escritos después (LabAgoraCiudadania,
 * LabArchivoFuentes, LabBayesCondicional…). Se alinea a la casa, no se crea
 * una tercera manera.
 *
 * Y el `:hover` va con él: llevaba `transform:translateX(-50%) translateY(-1px)`
 * para compensar el centrado. Sin el centrado, ese -50% MANDA EL BOTÓN FUERA
 * DE LA PANTALLA al pasar el ratón. Cambiar la posición y olvidar el hover es
 * peor que no tocar nada.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const LABS = join(dirname(fileURLToPath(import.meta.url)), '../src/components/practicas/labs');
const SECO = process.argv.includes('--seco');

const tocados = [];
for (const nombre of readdirSync(LABS).filter((f) => /^Lab.*\.tsx$/.test(f))) {
  const ruta = join(LABS, nombre);
  const crudo = readFileSync(ruta, 'utf8');
  /* La copia de trabajo es CRLF y el repositorio LF: sin normalizar, ninguna
   * expresión que cruce un salto de línea casa. */
  const s = crudo.replace(/\r\n/g, '\n');
  /* El desplazamiento de abajo varía (16, 54, 72): a cuatro ya les habían
   * subido la píldora a mano para esquivar el texto, y seguían centradas. */
  if (!/-teoria-fab \{ position:absolute; bottom:\d+px; left:50%;/.test(s)) continue;

  let n = s.replace(
    /(-teoria-fab \{ position:absolute; bottom:)\d+px; left:50%; transform:translateX\(-50%\); /g,
    '$116px; right:16px; ',
  );
  /* El hover compensaba el centrado; ahora sobra y sería dañino. */
  n = n.replace(
    /(-teoria-fab:hover \{ background:rgba\(\$\{color\.rgba\},0\.28\); transform:)translateX\(-50%\) (translateY\(-1px\);)/g,
    '$1$2',
  );

  if (n === s) continue;
  if (!SECO) writeFileSync(ruta, n, 'utf8');
  tocados.push(nombre);
}

console.log(`${SECO ? '[seco] ' : ''}${tocados.length} laboratorios con el botón fuera del texto`);
if (!tocados.length) console.log('nada que hacer (o el patrón cambió: revísalo a mano antes de dar por bueno el cero)');
