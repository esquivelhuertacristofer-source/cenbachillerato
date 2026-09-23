#!/usr/bin/env node
/**
 * QUE EL ARRASTRE RESPONDA.
 *
 *     node scripts/arrastre-vivo.mjs [--seco]
 *
 * MEDIDO ANTES DE TOCAR: de 207 laboratorios, UNO reaccionaba al pasar una
 * tarjeta por encima de una zona. En los otros 206 levantabas la ficha y la
 * interfaz se quedaba muerta hasta soltar. Los `dragProps`/`dropProps` están
 * copiados LITERALMENTE en 63 y 62 laboratorios, así que se arreglan a la vez.
 *
 * QUÉ AÑADE:
 *  - `dragProps`: marca la tarjeta de origen mientras viaja y la desmarca al
 *    terminar, pase lo que pase (también si se suelta fuera).
 *  - `dropProps`: enciende la zona al entrar y la apaga al salir o al soltar.
 *
 * POR QUÉ CON `data-*` Y NO CON ESTADO. Un `useState` por cada `dragenter`
 * redibuja el laboratorio entero decenas de veces mientras mueves la mano. El
 * atributo lo pinta el CSS de `_arrastre.tsx` y no cuesta un solo render.
 *
 * `dragleave` SALTA TAMBIÉN AL PASAR SOBRE UN HIJO de la zona, así que apagar
 * sin más deja la zona parpadeando. Se comprueba que el puntero salió de
 * verdad del rectángulo antes de apagar.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const LABS = join(dirname(fileURLToPath(import.meta.url)), '../src/components/practicas/labs');
const SECO = process.argv.includes('--seco');

const DRAG_VIEJO = `  const dragProps = (id: string) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
    },`;

const DRAG_NUEVO = `  const dragProps = (id: string) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
      // El hueco que deja la tarjeta mientras viaja. Por atributo y no por
      // estado: un render por cada gesto de arrastre se nota con 20 tarjetas.
      e.currentTarget.setAttribute("data-arrastrando", "true");
    },
    onDragEnd: (e: React.DragEvent) => {
      // También cuando se suelta FUERA de cualquier zona; si no, la tarjeta se
      // queda medio borrada para siempre.
      e.currentTarget.removeAttribute("data-arrastrando");
      document.querySelectorAll('[data-sobre="true"]').forEach((z) => z.removeAttribute("data-sobre"));
    },`;

const DROP_VIEJO = `  const dropProps = (onDrop: (id: string) => void) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },`;

const DROP_NUEVO = `  const dropProps = (onDrop: (id: string) => void) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      e.currentTarget.setAttribute("data-sobre", "true");
    },
    onDragLeave: (e: React.DragEvent) => {
      // \`dragleave\` salta también al pasar sobre un HIJO de la zona. Apagar sin
      // comprobar deja la zona parpadeando mientras mueves la mano por dentro.
      const r = e.currentTarget.getBoundingClientRect();
      const fuera = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      if (fuera) e.currentTarget.removeAttribute("data-sobre");
    },`;

/** El `onDrop` que ya existe, para apagar la zona al soltar. */
const APAGA_AL_SOLTAR = `    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.currentTarget.removeAttribute("data-sobre");
      const id = e.dataTransfer.getData("text/plain");`;
const DROP_ORIGINAL = `    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");`;

const tocados = [];
let conDrag = 0, conDrop = 0;

for (const nombre of readdirSync(LABS).filter((f) => /^Lab.*\.tsx$/.test(f))) {
  const ruta = join(LABS, nombre);
  /* CRLF en la copia de trabajo, LF en el repositorio. */
  const s = readFileSync(ruta, 'utf8').replace(/\r\n/g, '\n');
  if (s.includes('data-arrastrando') || s.includes('data-sobre')) continue; // idempotente

  let n = s;
  let hizo = false;
  if (n.includes(DRAG_VIEJO)) { n = n.replace(DRAG_VIEJO, DRAG_NUEVO); conDrag++; hizo = true; }
  if (n.includes(DROP_VIEJO)) {
    n = n.replace(DROP_VIEJO, DROP_NUEVO);
    if (n.includes(DROP_ORIGINAL)) n = n.replace(DROP_ORIGINAL, APAGA_AL_SOLTAR);
    conDrop++;
    hizo = true;
  }
  if (!hizo) continue;

  /* La zona necesita `position: relative` para el velo, que va en ::after. Sin
   * eso el velo se posiciona contra un ancestro cualquiera y tapa media
   * pantalla. Se pone desde el CSS con una regla acotada a las zonas activas. */

  if (!SECO) writeFileSync(ruta, n, 'utf8');
  tocados.push(nombre);
}

console.log(`${SECO ? '[seco] ' : ''}${tocados.length} laboratorios · ${conDrag} con tarjeta viva · ${conDrop} con zona viva`);
