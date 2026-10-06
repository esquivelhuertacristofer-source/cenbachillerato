/**
 * ENLAZA A SU CLASE LOS LABORATORIOS QUE EXISTEN PERO NO APARECEN EN NINGUNA.
 *
 * Un lab aparece dentro de la clase solo si una actividad de su progresión
 * tiene `practica_slug` (botón «Práctica experimental»). En octubre de 2026,
 * 70 de los 211 labs del registro estaban construidos y desplegados pero sin
 * esa columna: solo se llegaba a ellos desde «Todos los laboratorios».
 *
 * La progresión de cada lab NO se adivina por el nombre: se deduce del texto
 * de la BD que el lab cita literalmente (scripts/.auditoria/labs-hogar.json,
 * generado por la auditoría; cada lab tiene decenas de citas de una sola
 * progresión). Ancla, en este orden:
 *   1. la actividad que el archivo del lab declara (`LAB_UBICACION`), si es de esa progresión;
 *   2. la A1 de la progresión (la pieza expositiva), si está libre;
 *   3. la primera actividad libre de la progresión.
 * Nunca sobrescribe un `practica_slug` existente.
 *
 * Uso: npx tsx scripts/enlazar-labs-sueltos.ts            (simulación)
 *      npx tsx scripts/enlazar-labs-sueltos.ts --aplicar
 */
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { LAB_UBICACION } from '../src/lib/practicas/lab-ubicacion.generated';
import { PRACTICAS_META } from '../src/components/practicas/registry-meta';

loadEnv({ path: resolve(process.cwd(), '.env.local') });
const APLICAR = process.argv.includes('--aplicar');

const REVISADOS_A_MANO: Record<string, string> = { 'clima-vestimenta-ingles-3d': 'IN-I-P06' };

interface Hogar { slug: string; votos: [string, number][] }

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const acts: { id: string; codigo: string; tipo: string; practica_slug: string | null; progresion_id: string }[] = [];
  for (let d = 0; ; d += 1000) {
    const { data, error } = await sb.from('actividades').select('id,codigo,tipo,practica_slug,progresion_id').order('codigo').range(d, d + 999);
    if (error) throw error;
    acts.push(...(data as typeof acts));
    if (data.length < 1000) break;
  }
  const { data: progs, error: eP } = await sb.from('progresiones').select('id,codigo,numero');
  if (eP) throw eP;
  const progPorCodigo = new Map((progs ?? []).map((p) => [p.codigo as string, p]));
  const usados = new Set(acts.map((a) => a.practica_slug).filter(Boolean));
  const hogares = JSON.parse(readFileSync('scripts/.auditoria/labs-hogar.json', 'utf8')) as Hogar[];

  const plan: { slug: string; act: (typeof acts)[number]; porque: string }[] = [];
  const problemas: string[] = [];
  for (const h of hogares) {
    if (!PRACTICAS_META[h.slug]) { problemas.push(`${h.slug}: no está en el registro`); continue; }
    if (usados.has(h.slug)) { problemas.push(`${h.slug}: ya enlazado, se omite`); continue; }
    const [codigoProg, votos] = h.votos[0] ?? [];
    const segundo = h.votos[1]?.[1] ?? 0;
    // Revisado a mano: cita IN-I-P06 (29) e IN-II-P04 (18), dos progresiones con
    // el mismo tema (personas, vestimenta y clima). IN-II-P04 ya recibe
    // describir-personas-clima-ingles; este va a la de Inglés I.
    const decididoAMano = REVISADOS_A_MANO[h.slug] === codigoProg;
    if (!codigoProg || (!decididoAMano && (votos < 15 || votos < 3 * segundo))) { problemas.push(`${h.slug}: progresión dudosa (${h.votos.map((v) => v.join(':')).join(' ')})`); continue; }
    const prog = progPorCodigo.get(codigoProg);
    if (!prog) { problemas.push(`${h.slug}: progresión ${codigoProg} no existe`); continue; }
    const deProg = acts.filter((a) => a.progresion_id === prog.id).sort((a, b) => Number(a.codigo.match(/-A(\d+)$/)?.[1]) - Number(b.codigo.match(/-A(\d+)$/)?.[1]));
    const libre = (a?: (typeof acts)[number]) => a && !a.practica_slug && !plan.some((p) => p.act.id === a.id);
    const declarada = deProg.find((a) => a.codigo === LAB_UBICACION[h.slug]?.actividadCodigo);
    const a1 = deProg.find((a) => /-A1$/.test(a.codigo));
    let act: (typeof acts)[number] | undefined; let porque = '';
    if (libre(declarada)) { act = declarada; porque = 'declarada por el lab'; }
    else if (libre(a1)) { act = a1; porque = 'A1 de la progresión'; }
    else { act = deProg.find((a) => libre(a)); porque = 'primera libre'; }
    if (!act) { problemas.push(`${h.slug}: ${codigoProg} no tiene actividad libre`); continue; }
    plan.push({ slug: h.slug, act, porque });
  }

  for (const p of plan) console.log(`${p.slug.padEnd(36)} → ${p.act.codigo.padEnd(16)} (${p.act.tipo}; ${p.porque})`);
  console.log(`\nA enlazar: ${plan.length}`);
  if (problemas.length) console.log(`\nSin enlazar (${problemas.length}):\n  ` + problemas.join('\n  '));
  if (!APLICAR) { console.log('\n(simulación — usa --aplicar para escribir)'); return; }
  let ok = 0;
  for (const p of plan) {
    const { error } = await sb.from('actividades').update({ practica_slug: p.slug }).eq('id', p.act.id).is('practica_slug', null);
    if (error) console.log(`ERROR ${p.slug}: ${error.message}`); else ok++;
  }
  console.log(`Enlazados ${ok}/${plan.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
