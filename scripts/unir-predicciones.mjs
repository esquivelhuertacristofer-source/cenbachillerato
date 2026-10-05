// Junta data/predicciones/<slug>.json en src/components/practicas/expedicion/predicciones-labs.generated.ts
// (lo escriben los agentes que aplican docs/ESTANDAR-LABS.md §7). Uso: node scripts/unir-predicciones.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const DIR = 'data/predicciones';
const out = {};
const malos = [];
for (const f of readdirSync(DIR).filter((x) => x.endsWith('.json')).sort()) {
  const slug = f.replace(/\.json$/, '');
  try {
    const p = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
    const ok = p.pregunta && Array.isArray(p.opciones) && p.opciones.length === 3 && p.opciones.some((o) => o.id === p.correcta) && p.porque && p.comoComprobarlo;
    if (!ok) { malos.push(slug); continue; }
    out[slug] = { ...(p.escena ? { escena: p.escena } : {}), pregunta: p.pregunta, opciones: p.opciones.map(({ id, texto, icono }) => ({ id, texto, icono })), correcta: p.correcta, porque: p.porque, comoComprobarlo: p.comoComprobarlo };
  } catch { malos.push(slug); }
}
writeFileSync('src/components/practicas/expedicion/predicciones-labs.generated.ts',
  `// GENERADO por scripts/unir-predicciones.mjs desde data/predicciones/*.json — no editar a mano.\nimport type { Prediccion } from "./predicciones";\n\nexport const PREDICCIONES_LABS: Record<string, Prediccion> = ${JSON.stringify(out, null, 2)};\n`);
console.log(`${Object.keys(out).length} predicciones${malos.length ? `; inválidas: ${malos.join(', ')}` : ''}`);
