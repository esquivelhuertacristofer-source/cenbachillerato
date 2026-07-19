const { config } = require('dotenv');
const path = require('path');
config({ path: path.resolve(process.cwd(), '.env.local') });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: uacs, error: uacErr } = await sb
    .from('uac').select('id,codigo,nombre,semestre').eq('semestre', 1).order('codigo');
  if (uacErr) throw uacErr;
  const uacIds = uacs.map((u) => u.id);
  const uacMap = new Map(uacs.map((u) => [u.id, u]));

  const { data: progs, error: progErr } = await sb
    .from('progresiones').select('id,codigo,titulo,numero,uac_id').in('uac_id', uacIds).order('codigo');
  if (progErr) throw progErr;
  const progIds = progs.map((p) => p.id);
  const progMap = new Map(progs.map((p) => [p.id, p]));

  let all = [];
  const pageSize = 500;
  for (let page = 0; ; page++) {
    const { data: batch, error } = await sb
      .from('actividades')
      .select('codigo,tipo,titulo,practica_slug,progresion_id')
      .in('progresion_id', progIds)
      .not('practica_slug', 'is', null)
      .order('codigo')
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) throw error;
    if (!batch || batch.length === 0) break;
    all = all.concat(batch);
    if (batch.length < pageSize) break;
  }

  console.log('Total actividades con practica_slug en Semestre 1:', all.length);
  for (const a of all) {
    const prog = progMap.get(a.progresion_id);
    const uac = prog ? uacMap.get(prog.uac_id) : null;
    console.log(`${a.codigo} | tipo=${a.tipo} | prog.numero=${prog?.numero} | uac=${uac?.codigo} | slug=${a.practica_slug} | ${a.titulo}`);
  }
}
main().catch((e) => { console.error('ERROR:', e); process.exit(1); });
