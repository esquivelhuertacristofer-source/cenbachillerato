/**
 * Post-build patch: la intercepción de caché de OpenNext no reconoce la raíz `/`.
 *
 * `dangerous.enableCacheInterception` (open-next.config.ts) sirve las páginas
 * prerenderizadas directo desde KV sin arrancar el servidor de Next. Pero en
 * @opennextjs/aws 4.0.x el interceptor le quita la barra final a la ruta, así
 * que `/` se vuelve `""`: no aparece en el prerender-manifest y la portada —la
 * página más visitada— se salta la intercepción y paga el arranque completo
 * (~170 ms de CPU medidos en producción; el plan Free de Workers corta en 10 ms).
 *
 * @opennextjs/aws 4.1.x ya lo corrige exactamente así (`|| "/"` y la clave de
 * caché `/index` para la raíz). Este parche replica ese arreglo sobre el
 * middleware ya generado. Cuando se actualice @opennextjs/cloudflare a una
 * versión que traiga aws >= 4.1, este script avisa que no encontró qué parchar
 * y se puede borrar.
 *
 * Run after `npx @opennextjs/cloudflare build`:
 *   node scripts/postbuild-cache-interception.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const middlewarePath = path.join(__dirname, "..", ".open-next", "middleware", "handler.mjs");

if (!fs.existsSync(middlewarePath)) {
  console.error(`No existe ${middlewarePath}. Corre primero el build de OpenNext.`);
  process.exit(1);
}

const PARCHES = [
  {
    viejo: "localizedPath = decodePathParams(localizedPath);",
    nuevo: 'localizedPath = decodePathParams(localizedPath) || "/";',
  },
  {
    viejo: 'await globalThis.incrementalCache.get(localizedPath ?? "/index");',
    nuevo: 'await globalThis.incrementalCache.get(localizedPath === "/" ? "/index" : localizedPath);',
  },
];

let content = fs.readFileSync(middlewarePath, "utf-8");

if (PARCHES.every(({ viejo }) => !content.includes(viejo))) {
  console.log("cache-interception: no hay nada que parchar (¿OpenNext ya trae el arreglo de la raíz?).");
  process.exit(0);
}

for (const { viejo } of PARCHES) {
  const veces = content.split(viejo).length - 1;
  if (veces !== 1) {
    console.error(`cache-interception: se esperaba 1 aparición de «${viejo}» y hay ${veces}. No se parcha nada.`);
    process.exit(1);
  }
}

for (const { viejo, nuevo } of PARCHES) content = content.replace(viejo, nuevo);
fs.writeFileSync(middlewarePath, content, "utf-8");
console.log("cache-interception: la raíz / ya se sirve desde KV.");
