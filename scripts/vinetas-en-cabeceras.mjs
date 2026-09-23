#!/usr/bin/env node
/**
 * LAS ILUSTRACIONES, DENTRO DEL LABORATORIO.
 *
 *     node scripts/vinetas-en-cabeceras.mjs [--seco]
 *
 * Hay 2.115 ilustraciones de plastilina en `public/media/labs-terminos/` y
 * hasta ahora solo salían en la portada de la Expedición y en la ficha teórica.
 * Dentro del laboratorio —donde el alumno pasa el rato— no había ni una: solo
 * tarjetas de texto sobre fondo oscuro con un icono monocromo al lado.
 *
 * Medido: los 207 laboratorios tienen rótulos con imagen ya en disco, 2.119 en
 * total. (Una medición anterior decía «1 de 93»; rastreaba el alias hasta el
 * objeto y lo perdía en cuanto el objeto vivía en otro archivo. Se hizo al
 * revés —recoger los rótulos y preguntar al disco— y salió el número real.)
 *
 * QUÉ CAMBIA. El icono que va pegado al título de una zona o de una categoría
 * pasa a ser `<VinetaTermino>`: si ese término tiene su ilustración, se pinta;
 * si no, el componente dibuja EXACTAMENTE el mismo icono de antes. Ningún
 * laboratorio puede empeorar.
 *
 * POR QUÉ CON CUIDADO. El primer intento de este codemod cazó `{paso.icon}` +
 * `{paso.t}` de una lista de pasos: no era una cabecera, era un procedimiento.
 * Aquí el campo del título tiene que llamarse como se llaman los títulos
 * (`titulo`, `nombre`, `termino`…), el icono y el título tienen que salir del
 * MISMO objeto, y si el `<i>` no lleva un color legible se informa y no se
 * toca: inventar `${obj}.color` rompió la compilación la otra vez.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const LABS = join(dirname(fileURLToPath(import.meta.url)), '../src/components/practicas/labs');
const SECO = process.argv.includes('--seco');

/* `<i className={`fa-solid ${OBJ.CAMPO}`} style={{ color: LO_QUE_SEA }} />`
 * seguido de `<span …>{OBJ.TITULO}</span>`, con lo que haya entre medias
 * mientras no sea otra etiqueta.
 *
 * El icono y el título salen del MISMO objeto: es lo que distingue una cabecera
 * («este bloque trata de X») de una lista de pasos, donde cada elemento trae su
 * propio icono sin que el conjunto tenga término. */
const PATRON = new RegExp(
  '<i\\s+className=\\{`fa-solid \\$\\{(\\w+)\\.(icono|icon)\\}`\\}' + // 1 obj · 2 campo icono
  '\\s+style=\\{\\{\\s*color:\\s*([^}]+?)\\s*\\}\\}\\s*/>' +          // 3 color
  '(\\s*)' +                                                          // 4 separación
  '<span([^>]*)>\\{\\1\\.(titulo|title|nombre|termino|label)\\}</span>', // 5 attrs · 6 campo título
  'g',
);

const tocados = [];
let total = 0;
const sinColor = [];

for (const nombre of readdirSync(LABS).filter((f) => /^Lab.*\.tsx$/.test(f))) {
  const ruta = join(LABS, nombre);
  const s = readFileSync(ruta, 'utf8').replace(/\r\n/g, '\n');
  if (s.includes('VinetaTermino')) continue; // idempotente

  let n = 0;
  let salida = s.replace(PATRON, (todo, obj, campoIcono, color, sep, attrs, campoTitulo) => {
    /* Un color que no se puede leer no se inventa: la otra vez `${obj}.color`
     * no existía en cuatro laboratorios y rompió la compilación. */
    if (!color || /[<>]/.test(color)) { sinColor.push(nombre); return todo; }
    /* EL `style` DEL ICONO SUELE TRAER MÁS COSAS DETRÁS DEL COLOR
     * (`{ color: info.color, fontSize: 13 }`), y el color puede llevar comas
     * propias (`rgba(…, .4)`). Se corta en la primera coma de nivel cero: lo
     * de después era estilo del `<i>`, que desaparece con él. Sin este corte
     * salía `color={info.color, fontSize: 13}` y no compilaba. */
    let prof = 0, corte = color.length;
    for (let k = 0; k < color.length; k++) {
      const c = color[k];
      if (c === '(') prof++;
      else if (c === ')') prof--;
      else if (c === ',' && prof === 0) { corte = k; break; }
    }
    color = color.slice(0, corte).trim();
    if (!color) { sinColor.push(nombre); return todo; }
    /* EL TAMAÑO SALE DEL ICONO QUE SUSTITUYE. No todas estas parejas son
     * cabeceras de tarjeta: algunas son chips de una barra compacta, con el
     * icono a 12 px y ancho 16. Una viñeta de 38 px ahí dentro reventaría la
     * fila. Se lee el `fontSize` del `<i>` y la viñeta crece en proporción. */
    const fs = Number((todo.match(/fontSize:\s*(\d+)/) || [])[1]);
    const tam = fs ? Math.min(40, Math.max(24, Math.round(fs * 2.2))) : 34;
    n++;
    return (
      `<VinetaTermino termino={${obj}.${campoTitulo}} color={${color}} icono={${obj}.${campoIcono}} tam={${tam}} radio={${Math.round(tam / 3.6)}} />` +
      sep + `<span${attrs}>{${obj}.${campoTitulo}}</span>`
    );
  });
  if (!n) continue;

  /* EL IMPORT, DETRÁS DEL ÚLTIMO IMPORT COMPLETO.
   *
   * Con `/^import .*$/` el último acierto era la línea suelta `import {` de un
   * import repartido en varias líneas, y el nuevo import se colaba DENTRO de
   * las llaves. Quince laboratorios dejaron de compilar. Un import termina en
   * `from "…";`, y eso es lo que se busca. */
  const imports = [...salida.matchAll(/^import [\s\S]*?from "[^"]+";$/gm)];
  const ultimo = imports[imports.length - 1];
  salida = salida.slice(0, ultimo.index + ultimo[0].length) +
    '\nimport { VinetaTermino } from "./_vineta";' +
    salida.slice(ultimo.index + ultimo[0].length);

  if (!SECO) writeFileSync(ruta, salida, 'utf8');
  tocados.push(`${nombre.replace('.tsx', '')}:${n}`);
  total += n;
}

console.log(`${SECO ? '[seco] ' : ''}${tocados.length} laboratorios · ${total} cabeceras`);
if (sinColor.length) console.log(`sin color legible, NO tocadas: ${[...new Set(sinColor)].join(', ')}`);
console.log(tocados.join(' '));
