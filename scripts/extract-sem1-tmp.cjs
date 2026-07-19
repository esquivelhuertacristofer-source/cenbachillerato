const { config } = require('dotenv');
const path = require('path');
const fs = require('fs');
config({ path: path.resolve(process.cwd(), '.env.local') });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: uacs, error: uacErr } = await sb
    .from('uac')
    .select('id,codigo,nombre,semestre')
    .eq('semestre', 1)
    .order('codigo');
  if (uacErr) throw uacErr;

  const uacIds = uacs.map((u) => u.id);
  const uacMap = new Map(uacs.map((u) => [u.id, u]));

  const { data: progs, error: progErr } = await sb
    .from('progresiones')
    .select('id,codigo,titulo,numero,uac_id')
    .in('uac_id', uacIds)
    .order('codigo');
  if (progErr) throw progErr;

  const progIds = progs.map((p) => p.id);
  const progMap = new Map(progs.map((p) => [p.id, p]));

  let allActividades = [];
  const pageSize = 500;
  for (let page = 0; ; page++) {
    const { data: batch, error } = await sb
      .from('actividades')
      .select('codigo,tipo,titulo,contenido,xp,progresion_id')
      .in('progresion_id', progIds)
      .order('codigo')
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) throw error;
    if (!batch || batch.length === 0) break;
    allActividades = allActividades.concat(batch);
    console.log(`  pagina ${page + 1}: ${batch.length} (total ${allActividades.length})`);
    if (batch.length < pageSize) break;
  }

  const rows = allActividades.map((a) => {
    const prog = progMap.get(a.progresion_id);
    const uac = prog ? uacMap.get(prog.uac_id) : null;
    return {
      codigo: a.codigo,
      tipo: a.tipo,
      titulo: a.titulo,
      contenido: a.contenido,
      xp: a.xp,
      progresion_codigo: prog?.codigo ?? '',
      progresion_titulo: prog?.titulo ?? '',
      progresion_numero: prog?.numero ?? 0,
      uac: uac?.codigo ?? '',
      uac_nombre: uac?.nombre ?? '',
    };
  });

  const byTipo = {};
  const byUac = {};
  for (const r of rows) {
    byTipo[r.tipo] = (byTipo[r.tipo] || 0) + 1;
    byUac[r.uac] = (byUac[r.uac] || 0) + 1;
  }

  const outDir = path.resolve(process.cwd(), 'docs/auditoria/data');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.resolve(outDir, 'sem1-actividades-completo.json');
  fs.writeFileSync(
    outPath,
    JSON.stringify({ total: rows.length, byTipo, byUac, uacs, progresiones: progs, actividades: rows }, null, 2),
    'utf-8'
  );

  console.log('\nTotal actividades semestre 1:', rows.length);
  console.log('Por UAC:', JSON.stringify(byUac, null, 2));
  console.log('Por tipo:', JSON.stringify(byTipo, null, 2));
  console.log('Progresiones:', progs.length);
  console.log('Archivo:', outPath);
}

main().catch((e) => {
  console.error('ERROR:', e);
  process.exit(1);
});
