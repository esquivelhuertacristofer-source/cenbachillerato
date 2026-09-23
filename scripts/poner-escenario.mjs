#!/usr/bin/env node
/**
 * PONERLE SUELO Y LUZ DE ESTUDIO A LAS ESCENAS QUE ESTÁN EN EL VACÍO.
 *
 *     node scripts/poner-escenario.mjs                    dice qué haría
 *     node scripts/poner-escenario.mjs --aplicar          lo hace
 *     node scripts/poner-escenario.mjs --aplicar PhScene  sólo esa
 *
 * 112 de las 138 escenas no tienen suelo. Hacerlo a mano ciento doce veces no
 * es trabajo, es una rifa: a la trigésima se cuela un número mal y una pieza
 * queda hundida en la mesa.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DE DÓNDE SALE LA ALTURA DEL SUELO, QUE ES LO ÚNICO DELICADO
 * ═══════════════════════════════════════════════════════════════════════════
 * Poner la mesa a una altura inventada es peor que no ponerla: los objetos
 * quedan flotando por encima o medio enterrados, y eso sí que se ve.
 *
 * Pero el dato ya está escrito en cada escena. Casi todas tienen un
 * `<ContactShadows position={[0, Y, 0]}>` — la mancha oscura que simula el
 * apoyo — y esa `Y` es exactamente donde su autor decidió que estaba el piso.
 * No hay que adivinar nada: se lee.
 *
 * Las que NO tienen sombra de contacto se dejan en paz y se listan al final.
 * En esas hay que mirar la escena y decidir a mano; son las menos.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * QUÉ SE SUSTITUYE
 * ═══════════════════════════════════════════════════════════════════════════
 * El bloque de fondo + niebla + luces y el `<Environment>` de Lightformers se
 * cambian por un `<Escenario>`, que trae los tres y además la mesa. La sombra
 * de contacto vieja se quita porque el escenario pone la suya a la altura del
 * suelo.
 *
 * Se respeta el acento de cada escena (`accent` o `props.accent`): es lo que
 * le da a cada práctica su atmósfera y no debe uniformarse.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const LABS = join(AQUI, '../src/components/practicas/labs');

const APLICAR = process.argv.includes('--aplicar');
const SOLO = process.argv.slice(2).filter((a) => !a.startsWith('--'));

const verde = (t) => `\x1b[32m${t}\x1b[0m`;
const ambar = (t) => `\x1b[33m${t}\x1b[0m`;
const gris = (t) => `\x1b[90m${t}\x1b[0m`;

const archivos = readdirSync(LABS)
  .filter((f) => f.endsWith('Scene.tsx'))
  .filter((f) => !SOLO.length || SOLO.some((s) => f.startsWith(s)));

const hechos = [];
const sinSombra = [];
const yaTenian = [];

for (const nombre of archivos) {
  const ruta = join(LABS, nombre);
  /* A fin de línea de Unix antes de tocar nada.
   *
   * La copia de trabajo tiene fin de línea de Windows, y TODAS las
   * expresiones de aquí abajo terminan en `\n`: delante hay un `\r` y no
   * casaba ni una. El codemod decía «110 escenas hay que mirarlas a mano» y
   * el motivo era un carácter invisible. El repositorio guarda LF de todas
   * formas, así que escribirlo así no ensucia el diff. */
  let s = readFileSync(ruta, 'utf8').replace(/\r\n/g, '\n');

  if (s.includes('_escenario')) { yaTenian.push(nombre); continue; }
  /* Si ya hay suelo propio —una mesa, una rejilla, un plano grande— la escena
   * ya está compuesta y meterle otra sería pisarle el trabajo a su autor. */
  if (/MeshReflectorMaterial|<Grid|planeGeometry args=\{\[(1[0-9]|[2-9][0-9])/.test(s)) {
    yaTenian.push(nombre);
    continue;
  }

  /* Un suelo hecho con una caja grande también es un suelo: esas escenas ya
   * están apoyadas y sólo les faltaría la luz, que no compensa el riesgo de
   * recomponerlas. */
  if (/boxGeometry args=\{\[\s*(1[0-9]|[2-9][0-9])/.test(s)) { yaTenian.push(nombre); continue; }

  /* La altura del suelo, leída de la sombra que ya existe.
   *
   * Si no hay sombra, no se inventa: se deja SIN `suelo` y el escenario lo
   * mide de la propia escena al montarse (`useSueloMedido`). Adivinar veinte
   * alturas a ojo es una rifa; medirlas es un recorrido del grafo. */
  const csExpr = s.match(/<ContactShadows[^>]*position=\{\[\s*[-\d.]+\s*,\s*([^,\]]+)\s*,/);
  const suelo = csExpr ? csExpr[1].trim() : null;

  /* ¿Va MESA o no?
   *
   * Una mesa de laboratorio debajo de una escena de órbitas con estrellas es
   * peor que no tener suelo: contradice lo que la escena está contando. Lo
   * mismo con una molécula flotando o una célula vista por dentro — ahí no
   * hay «abajo».
   *
   * La señal fiable es lo que la propia escena ya declara: si dibuja campo de
   * estrellas, está en el espacio. Esas se quedan con la luz y el entorno
   * —que es lo que les faltaba— y sin mesa. */
  const enElEspacio = /<Stars\b/.test(s);

  /* El acento tal y como esta escena lo nombra. */
  const acento = /props\.accent/.test(s) ? 'props.accent' : /\baccent\b/.test(s) ? 'accent' : '"#38bdf8"';
  const acentoJsx = acento.startsWith('"') ? acento : `{${acento}}`;

  const antes = s;

  /* El Escenario va DONDE ESTABA EL FONDO, no detrás del `<Canvas>`.
   *
   * Casi todas estas escenas delegan en un `<Contenido>` y las luces viven
   * ahí dentro: metiéndolo al nivel del Canvas quedaría en otro ámbito, y un
   * `accent` que allí no existe no compila. Donde estaba `<color>` está, por
   * construcción, el sitio correcto.
   *
   * (Buscar el cierre del `<Canvas>` con una expresión regular tampoco vale:
   * cualquier prop con una función flecha trae un `>` y la corta por la
   * mitad. Falló en 56 de 138 escenas antes de caer en la cuenta.) */
  const MARCA = '@@ESCENARIO@@';
  const tieneFondo = /^[ \t]*<color attach="background"[^/]*\/>\n/m.test(s);
  s = s.replace(/^[ \t]*<color attach="background"[^/]*\/>\n/m, MARCA + '\n');
  s = s.replace(/^[ \t]*<fog attach="fog"[^/]*\/>\n/m, '');
  s = s.replace(/^[ \t]*<ambientLight[^/]*\/>\n/m, '');
  s = s.replace(/^[ \t]*<directionalLight[\s\S]*?\/>\n/m, '');
  /* Las luces de punto: SÓLO las decorativas.
   *
   * El escenario trae su propio relleno teñido y su contraluz, así que las
   * de adorno sobran. Pero varias de estas escenas usan una `<pointLight>`
   * como INFORMACIÓN: el color sale de una variable que sube con la
   * temperatura, o la intensidad late con una reacción. Quitarlas apagaría
   * la señal de «esto se está calentando», que es justo lo que el alumno
   * tiene que ver.
   *
   * La regla: se va la que es constante o la que sólo se tiñe con el acento
   * —eso ya lo hace el escenario—; se queda cualquier otra que lea una
   * variable de la escena. */
  const decorativa = (tag) => {
    const vars = tag.match(/\{[^}]*\}/g) ?? [];
    return vars.every((v) => /^\{[-\d.\s[\],]+\}$/.test(v) || /^\{`?#?\$?\{?(props\.)?accent\}?`?\}$/.test(v));
  };
  /* De atrás hacia delante: quitando por posición, las que quedan no se
   * desplazan. Recorriéndolo al revés con `replace` de la primera coincidencia
   * bastaría una luz informativa para detener el barrido y dejar las
   * decorativas de después. */
  const luces = [...s.matchAll(/^[ \t]*<pointLight[\s\S]*?\/>\n/gm)];
  for (let i = luces.length - 1; i >= 0; i--) {
    const l = luces[i];
    if (!decorativa(l[0])) continue;
    s = s.slice(0, l.index) + s.slice(l.index + l[0].length);
  }

  /* 2. El Environment de Lightformers: el Escenario trae el suyo. */
  s = s.replace(/^[ \t]*<Environment[\s\S]*?<\/Environment>\n/m, '');

  /* 3. La sombra de contacto vieja.
   *
   * A veces es el único hijo de un condicional —`{modo === "peso" && (…)}`—
   * y borrarla sola deja un `()` vacío, que no compila. Se quita el
   * condicional entero primero; sólo después la suelta. */
  s = s.replace(/^[ \t]*\{[^\n]*&&\s*\(\s*\n[ \t]*<ContactShadows[\s\S]*?\/>\s*\n[ \t]*\)\}\n/m, '');
  s = s.replace(/^[ \t]*<ContactShadows[\s\S]*?\/>\n/m, '');

  if (s === antes) { sinSombra.push(nombre); continue; }

  /* 4. El Escenario, en el hueco que dejó el fondo. */
  if (!tieneFondo) { sinSombra.push(nombre); continue; }
  const sangria = '      ';
  s = s.replace(
    MARCA,
    `${sangria}{/* Suelo, luz de tres puntos y entorno que reflejar. */}\n` +
      (suelo
        ? `${sangria}{/* La altura sale de donde esta escena ya ponía su sombra de\n` +
          `${sangria}    contacto: es donde su autor decidió que estaba el piso. */}\n`
        : `${sangria}{/* Sin altura: esta escena no tenía sombra de la que leerla, así\n` +
          `${sangria}    que el escenario la MIDE de la propia escena al montarse, en\n` +
          `${sangria}    vez de que alguien la adivine. */}\n`) +
      `${sangria}<Escenario acento=${acentoJsx}${suelo ? ` suelo={${suelo}}` : ''}${enElEspacio ? ' mesa={false} niebla={false}' : ''} />`,
  );

  /* 5. El import, detrás del último que haya. */
  const imports = [...s.matchAll(/^import .*?;$/gm)];
  const fin = imports[imports.length - 1].index + imports[imports.length - 1][0].length;
  s = s.slice(0, fin) + '\nimport { Escenario } from "./_escenario";' + s.slice(fin);

  if (APLICAR) writeFileSync(ruta, s, 'utf8');
  hechos.push({ nombre, suelo, acento });
}

/* ── Barrer las importaciones que se quedaron huérfanas ──────────────────────
 *
 * Al llevarse el `<Environment>`, los `<Lightformer>` y la sombra de contacto,
 * sus nombres siguen importados de drei sin que nadie los use: 172 avisos del
 * linter que no dicen nada y tapan los que sí importan. Se quitan aquí, que es
 * donde se generaron, y no a mano archivo por archivo.
 *
 * Es idempotente: se puede volver a pasar sin efecto. */
let limpiados = 0;
if (APLICAR) {
  for (const nombre of archivos) {
    const ruta = join(LABS, nombre);
    const s = readFileSync(ruta, 'utf8').replace(/\r\n/g, '\n');
    const imp = s.match(/^import \{([^}]*)\} from "@react-three\/drei";$/m);
    if (!imp) continue;
    const nombres = imp[1].split(',').map((n) => n.trim()).filter(Boolean);
    /* Se cuenta el uso FUERA de la línea del import: si sólo aparece ahí,
     * está muerto. */
    const cuerpo = s.replace(imp[0], '');
    const vivos = nombres.filter((n) => new RegExp(`\\b${n.replace(/\W/g, '')}\\b`).test(cuerpo));
    if (vivos.length === nombres.length) continue;
    const nueva = vivos.length
      ? `import { ${vivos.join(', ')} } from "@react-three/drei";`
      : '';
    writeFileSync(ruta, s.replace(imp[0] + (vivos.length ? '' : '\n'), nueva), 'utf8');
    limpiados++;
  }
}

console.log(`\n  ${APLICAR ? 'APLICADO' : 'ENSAYO (usa --aplicar)'}\n`);
for (const h of hechos) {
  console.log(`  ${verde('escenario')} ${h.nombre.padEnd(34)} suelo=${String(h.suelo).padEnd(18)} ${gris(h.acento)}`);
}
console.log(`\n  ${hechos.length} escenas con escenario nuevo`);
if (yaTenian.length) console.log(`  ${gris(`${yaTenian.length} ya tenían suelo propio, intactas`)}`);
console.log(`  ${limpiados} archivos con importaciones huerfanas barridas`);
if (sinSombra.length) {
  console.log(`\n  ${ambar(`${sinSombra.length} sin sombra de contacto: hay que mirarlas a mano`)}`);
  console.log(gris('    ' + sinSombra.join('\n    ')));
}
