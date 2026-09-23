#!/usr/bin/env node
/**
 * DARLE CUERPO A LAS CURVAS DE LAS ESCENAS DE GRÁFICAS.
 *
 *     node scripts/poner-tablero.mjs                  dice qué haría
 *     node scripts/poner-tablero.mjs --aplicar
 *     node scripts/poner-tablero.mjs --aplicar Funciones
 *
 * 61 escenas dibujan con `<Line>` de drei, y `lineWidth` es grosor EN PÍXELES:
 * la línea no recibe luz, no proyecta sombra y mide lo mismo de cerca que de
 * lejos. Por eso una parábola bien calculada se ve pegada al fondo como una
 * calcomanía — que es, literalmente, la queja de «esto es solo un diagrama».
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * QUÉ SE CAMBIA Y QUÉ NO
 * ═══════════════════════════════════════════════════════════════════════════
 * NO todas las líneas de una escena son la protagonista. Hay guías, ejes
 * auxiliares, punteados que marcan una proyección. Convertirlas todas en tubos
 * engordaría la escena, la llenaría de brillos y además costaría triángulos
 * para nada.
 *
 * La regla es el grosor que su autor ya eligió:
 *
 *   · `lineWidth` ≥ 3 → es el trazo que se quiere ver. Pasa a tubo.
 *   · `lineWidth` 1–2 → es una guía. Se queda como está.
 *   · con `dashed`    → se queda SIEMPRE. Un tubo no se puede puntear sin
 *                       partirlo en trozos, y el punteado suele significar
 *                       algo (lo estimado, lo reflejado, lo que no cumple).
 *
 * Y el plano de fondo grande —`planeGeometry` de lado ≥ 6— pasa a ser un
 * tablero con grosor y marco. Un plano no tiene canto: al girar la cámara
 * desaparece y nada dice dónde acaba.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const LABS = join(AQUI, '../src/components/practicas/labs');

const APLICAR = process.argv.includes('--aplicar');
const SOLO = process.argv.slice(2).filter((a) => !a.startsWith('--'));

const verde = (t) => `\x1b[32m${t}\x1b[0m`;
const gris = (t) => `\x1b[90m${t}\x1b[0m`;

/**
 * Recorta un elemento `<Line ... />` completo desde su apertura.
 *
 * No vale una expresión regular: los `points` traen `[[-H, 0, 0], [H, 0, 0]]` y
 * funciones flecha con sus propios `>` y `/`. Se cuentan llaves y corchetes
 * hasta el `/>` que cierra de verdad.
 */
function cortarElemento(s, desde) {
  let i = desde;
  let llaves = 0;
  let enCadena = null;
  while (i < s.length) {
    const c = s[i];
    if (enCadena) {
      if (c === enCadena && s[i - 1] !== '\\') enCadena = null;
    } else if (c === '"' || c === "'" || c === '`') {
      enCadena = c;
    } else if (c === '{' || c === '[') {
      llaves++;
    } else if (c === '}' || c === ']') {
      llaves--;
    } else if (llaves === 0 && c === '/' && s[i + 1] === '>') {
      return { fin: i + 2, texto: s.slice(desde, i + 2) };
    } else if (llaves === 0 && c === '>') {
      return null; // <Line> con hijos: no es el caso, se deja en paz
    }
    i++;
  }
  return null;
}

/** El valor de una prop dentro del texto de un elemento. */
function prop(texto, nombre) {
  const m = texto.match(new RegExp(`\\b${nombre}=\\{`));
  if (!m) {
    const s = texto.match(new RegExp(`\\b${nombre}="([^"]*)"`));
    return s ? `"${s[1]}"` : null;
  }
  let i = m.index + m[0].length;
  let n = 1;
  const ini = i;
  while (i < texto.length && n > 0) {
    if (texto[i] === '{' || texto[i] === '[') n++;
    else if (texto[i] === '}' || texto[i] === ']') n--;
    if (n === 0) break;
    i++;
  }
  return texto.slice(ini, i);
}

const archivos = readdirSync(LABS)
  .filter((f) => f.endsWith('Scene.tsx'))
  .filter((f) => !SOLO.length || SOLO.some((s) => f.startsWith(s)));

const hechos = [];

for (const nombre of archivos) {
  const ruta = join(LABS, nombre);
  let s = readFileSync(ruta, 'utf8').replace(/\r\n/g, '\n');
  if (s.includes('_tablero')) continue;

  let curvas = 0;
  let paneles = 0;

  /* 1. Las líneas gruesas y sin puntear → tubos. De atrás hacia delante, para
   *    que los cortes no desplacen a los que faltan. */
  const aperturas = [...s.matchAll(/<Line\b/g)].map((m) => m.index).reverse();
  for (const ini of aperturas) {
    const el = cortarElemento(s, ini);
    if (!el) continue;
    if (/\bdashed\b/.test(el.texto)) continue;
    const ancho = prop(el.texto, 'lineWidth');
    const n = ancho ? Number(ancho) : NaN;
    if (!isFinite(n) || n < 3) continue;
    const puntos = prop(el.texto, 'points');
    const color = prop(el.texto, 'color');
    if (!puntos || !color) continue;
    /* La `key` se lee con el mismo lector que cuenta llaves, NO con una
     * expresión regular: casi todas son plantillas —key={`seg${i}`}— y
     * `[^}]*` corta en la llave de `${i}`, se lleva el acento de cierre y el
     * archivo deja de compilar. */
    const key = prop(el.texto, 'key');
    /* El grosor sale del que el autor eligió en píxeles, acotado: por encima
     * de 0,09 un trazo deja de leerse como línea y parece una manguera. */
    const grosor = Math.min(0.09, Math.round(n * 0.018 * 1000) / 1000);
    const col = color.startsWith('"') ? color : `{${color}}`;
    s =
      s.slice(0, ini) +
      `<CurvaTubo ${key ? `key={${key}} ` : ""}puntos={${puntos}} color=${col} grosor={${grosor}} />` +
      s.slice(el.fin);
    curvas++;
  }

  /* 2. El plano de fondo grande → tablero con grosor y marco. */
  s = s.replace(
    /<mesh([^>]*)>\s*\n\s*<planeGeometry args=\{\[([^\]]+)\]\} \/>\s*\n\s*<meshStandardMaterial[^/]*\/>\s*\n\s*<\/mesh>/g,
    (todo, attrs, args) => {
      const dims = args.split(',').map((x) => x.trim());
      if (dims.length < 2) return todo;
      /* Sólo el tablero de fondo: un plano pequeño puede ser una superficie de
       * agua, una sombra o una tarjeta, y convertirlo en panel lo rompería. */
      const grande = /(\d+(\.\d+)?)/.exec(dims[0]);
      if (!grande || Number(grande[1]) < 6) return todo;
      if (/rotation/.test(attrs)) return todo; // tumbado: es un suelo, no un tablero
      paneles++;
      return `<PanelGrafica ancho={${dims[0]}} alto={${dims[1]}} />`;
    },
  );

  if (!curvas && !paneles) continue;

  const usados = ['CurvaTubo', 'PanelGrafica'].filter((n) => new RegExp(`<${n}\\b`).test(s));
  const imports = [...s.matchAll(/^import .*?;$/gm)];
  const fin = imports[imports.length - 1].index + imports[imports.length - 1][0].length;
  s = s.slice(0, fin) + `\nimport { ${usados.join(', ')} } from "./_tablero";` + s.slice(fin);

  if (APLICAR) writeFileSync(ruta, s, 'utf8');
  hechos.push({ nombre, curvas, paneles });
}

console.log(`\n  ${APLICAR ? 'APLICADO' : 'ENSAYO (usa --aplicar)'}\n`);
for (const h of hechos) {
  console.log(
    `  ${verde('tablero')} ${h.nombre.replace('.tsx', '').padEnd(34)} ` +
      `${String(h.curvas).padStart(2)} curvas con cuerpo  ${gris(`${h.paneles} panel(es)`)}`,
  );
}
const tc = hechos.reduce((a, h) => a + h.curvas, 0);
const tp = hechos.reduce((a, h) => a + h.paneles, 0);
console.log(`\n  ${hechos.length} escenas · ${tc} curvas · ${tp} tableros\n`);
