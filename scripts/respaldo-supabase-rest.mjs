/**
 * RESPALDO DE DATOS DE SUPABASE POR LA API REST (sin contraseña de la base).
 *
 * El respaldo completo es `pg_dump` (workflow backup-supabase.yml), pero ese
 * camino necesita la contraseña de Postgres. Este script solo necesita la
 * llave de servicio: lista las tablas que expone la API (esquema `public`) y
 * baja TODAS sus filas, paginando, a un solo `.json.gz`.
 *
 * Qué NO trae (y cómo se recupera): el esquema, las políticas RLS y las
 * funciones viven en supabase/migrations/ del repo; las cuentas de `auth`
 * no se exponen por REST (solo pg_dump las respalda).
 *
 *   node scripts/respaldo-supabase-rest.mjs [carpeta-destino]
 *
 * Lee SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY del
 * entorno o, si no están, de .env.local.
 */
import { createWriteStream, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createGzip } from 'node:zlib';
import { once } from 'node:events';

function leerEnvLocal() {
  if (!existsSync('.env.local')) return {};
  return Object.fromEntries(readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).replace(/^"|"$/g, '')]));
}
const local = leerEnvLocal();
const URL_BASE = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || local.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const LLAVE = process.env.SUPABASE_SERVICE_ROLE_KEY || local.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_BASE || !LLAVE) {
  console.error('Falta SUPABASE_URL (o NEXT_PUBLIC_SUPABASE_URL) o SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}
const CABECERAS = { apikey: LLAVE, Authorization: `Bearer ${LLAVE}` };
const POR_PAGINA = 1000;

async function pedir(ruta, extra = {}) {
  for (let intento = 1; ; intento++) {
    const r = await fetch(`${URL_BASE}/rest/v1/${ruta}`, { headers: { ...CABECERAS, ...extra } });
    if (r.ok) return r;
    if (intento >= 3 || r.status < 500) throw new Error(`${ruta}: HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
    await new Promise((res) => setTimeout(res, 2000 * intento));
  }
}

// La raíz de PostgREST devuelve su OpenAPI: cada «path» /tabla es una tabla o vista expuesta.
const api = await (await pedir('', { Accept: 'application/openapi+json' })).json();
const tablas = Object.keys(api.paths ?? {})
  .filter((p) => p !== '/' && !p.startsWith('/rpc/'))
  .map((p) => p.slice(1))
  .sort();

const destino = process.argv[2] || 'respaldos';
mkdirSync(destino, { recursive: true });
const fecha = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 16);
const archivo = join(destino, `supabase-datos-${fecha}.json.gz`);
const gz = createGzip({ level: 9 });
const salida = createWriteStream(archivo);
gz.pipe(salida);
const escribir = async (s) => { if (!gz.write(s)) await once(gz, 'drain'); };

const resumen = {};
await escribir(`{"fecha":${JSON.stringify(new Date().toISOString())},"origen":${JSON.stringify(URL_BASE)},"tablas":{`);
for (const [i, t] of tablas.entries()) {
  await escribir(`${i ? ',' : ''}${JSON.stringify(t)}:[`);
  let n = 0;
  for (let desde = 0; ; desde += POR_PAGINA) {
    const r = await pedir(`${encodeURIComponent(t)}?select=*`, { Range: `${desde}-${desde + POR_PAGINA - 1}`, 'Range-Unit': 'items' });
    const filas = await r.json();
    for (const f of filas) await escribir(`${n++ ? ',' : ''}${JSON.stringify(f)}`);
    if (filas.length < POR_PAGINA) break;
  }
  await escribir(']');
  resumen[t] = n;
}
await escribir(`},"filas_por_tabla":${JSON.stringify(resumen)}}`);
gz.end();
await once(salida, 'finish');

const total = Object.values(resumen).reduce((a, b) => a + b, 0);
console.log(`Respaldo: ${archivo} — ${tablas.length} tablas, ${total} filas, ${(statSync(archivo).size / 1024 / 1024).toFixed(2)} MB`);
for (const [t, n] of Object.entries(resumen)) console.log(`  ${t}: ${n}`);
if (process.env.GITHUB_ENV) {
  const { appendFileSync } = await import('node:fs');
  appendFileSync(process.env.GITHUB_ENV, `DUMP_NOMBRE=${archivo.split(/[\\/]/).pop()}\nDUMP_RUTA=${archivo}\n`);
}
