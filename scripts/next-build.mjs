#!/usr/bin/env node
/**
 * `next build` CON MEMORIA SUFICIENTE PARA REVISAR LOS TIPOS.
 *
 * El build revisa los tipos de TODO el proyecto en el paso «Running
 * TypeScript». Con los laboratorios 3D ese paso ya pasa de los ~2 GB que Node
 * da por defecto y el proceso muere con «JavaScript heap out of memory». Pasó
 * en el Workers Builds de UVEG el 2026-10-13, con este mismo código; aquí el
 * CI pasaba al filo. En local no salía porque se construía a mano con más
 * memoria.
 *
 * Se pasa por NODE_OPTIONS, no como bandera de `node`: así lo heredan los
 * procesos hijos que lanza Next, y el que revisa los tipos es uno de ellos.
 * 5 GB caben en el contenedor de Workers Builds (8 GB) y en el runner de
 * GitHub (7 GB).
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const next = require.resolve("next/dist/bin/next");
const opciones = [process.env.NODE_OPTIONS, "--max-old-space-size=5120"].filter(Boolean).join(" ");

const r = spawnSync(process.execPath, [next, "build", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: { ...process.env, NODE_OPTIONS: opciones },
});
process.exit(r.status ?? 1);
