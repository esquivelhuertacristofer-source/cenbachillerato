#!/usr/bin/env node
/**
 * ABRIR UN LABORATORIO COMO LO ABRE UN ALUMNO, Y FOTOGRAFIARLO.
 *
 *     node scripts/mirar-labs.mjs                      todos los 3D
 *     node scripts/mirar-labs.mjs ph-escala densidad   sólo esos
 *     SITIO=https://… node scripts/mirar-labs.mjs      contra producción
 *
 * POR QUÉ EXISTE. «Mejorar los gráficos» no se puede hacer a ciegas: un perfil
 * de torno mal armado, un material que deja la escena en negro o una pieza que
 * se queda flotando NO dan error de compilación. La única forma de saberlo es
 * mirar, y mirar 180 laboratorios a mano no se hace dos veces.
 *
 * LO QUE HAY ENTRE LA URL Y EL LIENZO. Un laboratorio no se abre: se recorre.
 * Primero la Expedición —portada, capítulo 1 con sus viñetas de «TOCAR PARA
 * DESCUBRIR», portada del capítulo 2— y en los de química, además, una
 * compuerta de equipo de protección que hay que resolver o saltar. Cada uno de
 * esos pasos dejó una sonda anterior encallada, así que están todos aquí.
 *
 * EL ORDEN DE LOS BOTONES IMPORTA. «Laboratorio» es también el nombre de la
 * pestaña del encabezado, que es un botón y está siempre presente: buscándolo
 * primero, la sonda se pasa el rato pulsando la pestaña en la que ya está.
 * Primero lo que AVANZA, después lo que cambia de capítulo.
 *
 * GPU DE VERDAD. ANGLE sobre D3D11. Con swiftshader cada cuadro tarda minutos
 * y las capturas salen a medio pintar, que se confunde con estar roto.
 *
 *   → capturas en scripts/.capturas-labs/<slug>.png
 */
import { chromium } from 'playwright';
import { mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const SITIO = process.env.SITIO || 'http://localhost:3124';
const SALIDA = process.env.SALIDA || join(AQUI, '.capturas-labs');
const USUARIO = process.env.LAB_USUARIO || 'alumno@demo.uveg.mx';
const CLAVE = process.env.LAB_CLAVE || 'UvegDemo2026';

/** Los slugs pedidos, o todos los que el registro marque como escena 3D. */
function slugsPedidos() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  if (args.length) return args;
  const reg = readFileSync(join(AQUI, '../src/components/practicas/registry.tsx'), 'utf8');
  /* Las comillas de la clave son OPCIONALES. Exigiéndolas, la sonda se saltaba
   * en silencio todos los laboratorios cuya clave es un identificador válido
   * —`densidad:`, `fluidos:`, `fotosintesis:`— y el barrido «de los 211»
   * visitaba 205. Un laboratorio no probado no da error: simplemente no sale
   * en la lista, y eso se lee igual que «todo bien». */
  return [...reg.matchAll(/^\s*"?([a-z0-9-]+)"?:\s*\{\s*\.\.\.PRACTICAS_META/gm)].map((m) => m[1]);
}

mkdirSync(SALIDA, { recursive: true });

const navegador = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const ctx = await navegador.newContext({ viewport: { width: 1280, height: 820 } });
const p = await ctx.newPage();

const errores = [];
p.on('pageerror', (e) => errores.push(String(e).slice(0, 220)));

await p.goto(SITIO + '/log-in', { waitUntil: 'domcontentloaded', timeout: 240000 });
/* Sin esperar a que React monte, los campos se rellenan y la hidratación los
 * vuelve a vaciar: el formulario sale en blanco y parece que la cuenta falla. */
await p.waitForLoadState('networkidle').catch(() => {});
await p.locator('input[type="email"]').first().fill(USUARIO);
await p.locator('input[type="password"]').first().fill(CLAVE);
await p.locator('input[type="checkbox"]').first().check();
await p.locator('button[type="submit"]').first().click();
await p.waitForURL((u) => !u.pathname.includes('/log-in'), { timeout: 90000 });
console.log(`sesion iniciada como ${USUARIO}\n`);

/** La compuerta de equipo de protección de los laboratorios de química. */
async function pasarCompuertaSeguridad() {
  const omitir = p.locator('a:has-text("omitir"), button:has-text("omitir")').first();
  if (await omitir.count()) await omitir.click({ timeout: 4000 }).catch(() => {});
  const entrar = p.locator('button:has-text("Entrar al laboratorio")').first();
  if (await entrar.count()) await entrar.click({ timeout: 4000 }).catch(() => {});
  await p.waitForTimeout(600);
}

/**
 * De la portada al lienzo.
 *
 * El camino tiene más escalones de los que parece: portada de la Expedición →
 * «Empezar» → portada del capítulo 1 → «Empezar» → las viñetas de «TOCAR PARA
 * DESCUBRIR» → «Capítulo 2: Laboratorio» → portada del capítulo 2 →
 * «Empezar» → y ahí sí, el laboratorio.
 *
 * Dos cosas que hicieron fallar a la versión anterior en siete laboratorios:
 *
 *  - Marcaba las viñetas como «ya tocadas» con una bandera, y como hay DOS
 *    portadas antes del capítulo 1, cuando por fin aparecían ya estaba puesta:
 *    nunca las tocaba y se quedaba a un paso del final.
 *
 *  - LAS VIÑETAS CONSERVAN SU RÓTULO. Una vez descubiertas siguen diciendo
 *    «TOCAR PARA DESCUBRIR», así que quitar la bandera sin más convierte el
 *    recorrido en un bucle infinito: tocar, volver a encontrarlas, tocar. Se
 *    limitan las rondas y, sobre todo, DESPUÉS DE TOCARLAS SE SIGUE BUSCANDO
 *    el botón que avanza en la misma vuelta, en vez de empezar otra.
 *
 *  - Después de la última viñeta, el «CAPÍTULO COMPLETADO» entra con
 *    animación: hay que esperarlo o parece que no hay por dónde seguir.
 */
async function hastaElLienzo() {
  /* Una ronda por capítulo con viñetas, y una de margen. */
  let rondas = 0;
  for (let i = 0; i < 22; i++) {
    if (await p.locator('canvas').count()) break;

    const tar = p.locator('button:has-text("TOCAR PARA DESCUBRIR")');
    const n = await tar.count();
    if (n && rondas < 3) {
      rondas++;
      for (let k = 0; k < n; k++) {
        await tar.nth(k).click({ timeout: 4000 }).catch(() => {});
        await p.waitForTimeout(180);
      }
      await p.waitForTimeout(1400);
    }

    /* EL ORDEN LO ES TODO, y esto costó dos rondas de averiguarlo.
     *
     * El «Empezar» de la portada anterior SIGUE EN EL DOM cuando ya se pasó
     * de pantalla —sólo está fuera de vista— y para Playwright eso es
     * visible: tiene caja y no está oculto. Buscándolo primero, la sonda lo
     * pulsaba una y otra vez hasta agotar las vueltas, con el botón bueno
     * delante y sin tocarlo.
     *
     * Así que primero va el que AVANZA DE CAPÍTULO, que además es
     * inconfundible: la pestaña del encabezado dice «2» o «2 Laboratorio»,
     * nunca «Capítulo 2». */
    const candidatos = [
      'button:has-text("Capítulo 2")',
      'button:has-text("Capítulo 3")',
      'button:has-text("Empezar")',
      'button:has-text("Siguiente")',
      'button:has-text("Continuar")',
    ];
    let bt = null;
    for (const sel of candidatos) {
      const l = p.locator(sel).first();
      if ((await l.count()) && (await l.isVisible().catch(() => false))) { bt = l; break; }
    }
    if (!bt) break;
    await bt.click({ timeout: 6000 }).catch(() => {});
    await p.waitForTimeout(1200);
  }
  await pasarCompuertaSeguridad();
}

const filas = [];
for (const slug of slugsPedidos()) {
  const antes = errores.length;
  try {
    await p.goto(`${SITIO}/hub/laboratorios/${slug}`, { waitUntil: 'domcontentloaded', timeout: 240000 });
    await p.waitForLoadState('networkidle').catch(() => {});
    await hastaElLienzo();
  } catch (e) {
    errores.push(`[navegacion] ${String(e).slice(0, 160)}`);
  }

  /* El Environment y el pase de transmisión tardan unos cuadros en resolverse;
   * sin esta espera se fotografía una escena a medio iluminar. */
  await p.waitForTimeout(4500);

  /* Los lienzos SE CUENTAN DESPUÉS DE ESPERAR. Contándolos antes, un
   * laboratorio cuyo `<Canvas>` llega por importación diferida salía con
   * «lienzos: 0» aunque la captura —tomada después— lo enseñaba pintado. El
   * informe acusaba a la escena de un defecto de la sonda. */
  const lienzos = await p.locator('canvas').count();

  const archivo = join(SALIDA, `${slug}.png`);
  if (lienzos) {
    await p.locator('canvas').first().screenshot({ path: archivo }).catch(() => p.screenshot({ path: archivo }));
  } else {
    await p.screenshot({ path: archivo });
  }

  const nuevos = errores.slice(antes);
  filas.push({ slug, lienzos, errores: nuevos });
  console.log(`${lienzos && !nuevos.length ? 'OK     ' : 'REVISAR'} ${slug.padEnd(30)} lienzos:${lienzos} errores:${nuevos.length}`);
  for (const e of nuevos) console.log(`          ${e}`);
}

await navegador.close();
const malos = filas.filter((f) => !f.lienzos || f.errores.length);
console.log(`\n${filas.length - malos.length}/${filas.length} abren y pintan sin errores`);
if (malos.length) console.log('a revisar: ' + malos.map((m) => m.slug).join(', '));
console.log(`capturas en ${SALIDA}`);
if (!existsSync(SALIDA)) process.exit(1);
