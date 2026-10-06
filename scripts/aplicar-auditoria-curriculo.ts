/**
 * APLICA LAS CORRECCIONES DE LA AUDITORÍA DE CURRÍCULO (2026-10).
 *
 * Entrada: scripts/.auditoria/hallazgos/*.json — cada hallazgo dice qué actividad
 * (`codigo`), qué campo (`ruta`, p. ej. `preguntas[2].opciones[1]`), qué texto
 * EXACTO hay (`actual`) y por qué cambiarlo (`propuesta`). Los escribieron
 * revisores por materia; este script no decide nada de contenido, solo aplica
 * con candados:
 *
 *   - Por defecto se aplican los de `confianza: "alta"`; los de «media» solo si
 *     llevan `"decision": "aplicar"` (los reviso a mano antes). `"decision":
 *     "omitir"` descarta cualquiera.
 *   - En un texto, `actual` debe aparecer EXACTAMENTE una vez; si no, se salta y
 *     se reporta (nunca se adivina).
 *   - En una clave (número/booleano) el valor actual debe ser `actual`.
 *   - `actual: ""` sobre una lista (alternativas_aceptadas) la sustituye por la
 *     lista JSON de `propuesta`.
 *   - Cada contenido resultante pasa por el MISMO validador Zod que usa la app;
 *     si deja de cumplir el esquema, esa actividad no se escribe.
 *   - Antes de escribir guarda el contenido original en
 *     scripts/.auditoria/respaldo-<fecha>.json.
 *   - Avisa si el texto corregido también vive copiado en el código de un lab
 *     (las fichas de los labs citan la BD), para corregirlo allí también.
 *
 * Uso: npx tsx scripts/aplicar-auditoria-curriculo.ts            (simulación)
 *      npx tsx scripts/aplicar-auditoria-curriculo.ts --aplicar
 */
import { config as loadEnv } from 'dotenv';
import { resolve, join } from 'path';
import { readFileSync, readdirSync, writeFileSync, statSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { validarContenidoActividad, VALIDADORES_CONTENIDO, type TipoActividadKey } from '../src/lib/activities/validators';

loadEnv({ path: resolve(process.cwd(), '.env.local') });
const APLICAR = process.argv.includes('--aplicar');
const DIR = 'scripts/.auditoria/hallazgos';

interface Hallazgo {
  codigo: string; ruta: string; severidad: string; tipo: string; problema: string;
  actual: string; propuesta: string; confianza: 'alta' | 'media'; decision?: 'aplicar' | 'omitir';
  _id?: string;
}

/** `a.b[2]["x y"].c` → ['a','b',2,'x y','c']. Las claves pueden llevar espacios y comas. */
function partirRuta(ruta: string): (string | number)[] {
  const out: (string | number)[] = [];
  let i = 0;
  while (i < ruta.length) {
    if (ruta[i] === '.') { i++; continue; }
    if (ruta[i] === '[') {
      const q = ruta[i + 1];
      if (q === '"' || q === "'") {
        const fin = ruta.indexOf(q + ']', i + 2);
        out.push(ruta.slice(i + 2, fin)); i = fin + 2;
      } else {
        const fin = ruta.indexOf(']', i);
        out.push(Number(ruta.slice(i + 1, fin))); i = fin + 1;
      }
      continue;
    }
    let j = i;
    while (j < ruta.length && ruta[j] !== '.' && ruta[j] !== '[') j++;
    out.push(ruta.slice(i, j)); i = j;
  }
  return out;
}

type Obj = Record<string | number, unknown>;

function aplicarUno(raiz: Obj, h: Hallazgo): string | null {
  const partes = partirRuta(h.ruta);
  let padre: Obj = raiz;
  for (const p of partes.slice(0, -1)) {
    const sig = padre?.[p];
    if (sig == null || typeof sig !== 'object') return `ruta inexistente en «${String(p)}»`;
    padre = sig as Obj;
  }
  const ult = partes.at(-1)!;
  const valor = padre[ult];

  if (h.actual === '' && valor === undefined && !h.propuesta.trim().startsWith('[')) {
    padre[ult] = h.propuesta; // campo que faltaba (p. ej. respuesta_final)
    return null;
  }
  if (h.actual === '') {
    let lista: unknown;
    try { lista = JSON.parse(h.propuesta); } catch { return 'propuesta no es JSON'; }
    if (!Array.isArray(lista)) return 'propuesta no es lista';
    if (valor !== undefined && !Array.isArray(valor)) return 'el campo no es lista';
    padre[ult] = lista;
    return null;
  }
  if (typeof valor === 'number' || typeof valor === 'boolean') {
    if (String(valor) !== h.actual.trim()) return `valor ${String(valor)} ≠ actual ${h.actual}`;
    const nuevo = typeof valor === 'number' ? Number(h.propuesta) : h.propuesta.trim() === 'true';
    if (typeof valor === 'number' && isNaN(nuevo as number)) return 'propuesta no numérica';
    if (typeof valor === 'boolean' && !['true', 'false'].includes(h.propuesta.trim())) return 'propuesta no booleana';
    padre[ult] = nuevo;
    return null;
  }
  if (typeof valor !== 'string') return `campo de tipo ${typeof valor}`;
  // Ya aplicado (dos revisores propusieron lo mismo): no duplicar.
  if (h.propuesta.includes(h.actual) && valor.includes(h.propuesta)) return null;
  const veces = valor.split(h.actual).length - 1;
  if (veces !== 1) return `«actual» aparece ${veces} veces`;
  padre[ult] = valor.replace(h.actual, () => h.propuesta);
  return null;
}

function archivosFuente(dir: string, out: string[] = []): string[] {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) { if (!/__tests__|node_modules/.test(p)) archivosFuente(p, out); }
    else if (/\.(ts|tsx)$/.test(n)) out.push(p);
  }
  return out;
}

async function main() {
  const hallazgos: Hallazgo[] = [];
  for (const f of readdirSync(DIR).filter((n) => n.endsWith('.json')).sort()) {
    const lista = JSON.parse(readFileSync(join(DIR, f), 'utf8')) as Hallazgo[];
    lista.forEach((h, i) => hallazgos.push({ ...h, _id: `${f.replace('.json', '')}#${i}` }));
  }
  // Decisiones de la verificación cruzada: aplicar / omitir / modificar (con texto final).
  const DEC = 'scripts/.auditoria/decisiones';
  let nDec = 0;
  try {
    const porId = new Map(hallazgos.map((h) => [h._id!, h]));
    for (const f of readdirSync(DEC).filter((n) => n.endsWith('.json'))) {
      for (const d of JSON.parse(readFileSync(join(DEC, f), 'utf8')) as { id: string; decision: string; propuesta?: string }[]) {
        const h = porId.get(d.id);
        if (!h) { console.log(`decisión sin hallazgo: ${d.id}`); continue; }
        nDec++;
        if (d.decision === 'omitir') h.decision = 'omitir';
        else if (d.decision === 'modificar' && d.propuesta) { h.decision = 'aplicar'; h.propuesta = d.propuesta; }
        else if (d.decision === 'aplicar') h.decision = 'aplicar';
      }
    }
  } catch { /* sin decisiones todavía */ }
  console.log(`decisiones de verificación leídas: ${nDec}`);
  const elegidos = hallazgos.filter((h) => h.decision === 'aplicar' || (h.decision !== 'omitir' && h.confianza === 'alta'));
  console.log(`hallazgos ${hallazgos.length} | a aplicar ${elegidos.length} | medias sin decidir ${hallazgos.filter((h) => h.confianza === 'media' && !h.decision).length}`);

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const codigos = [...new Set(elegidos.map((h) => h.codigo))];
  const filas: { id: string; codigo: string; tipo: string; titulo: string; descripcion: string | null; contenido: Obj }[] = [];
  for (let i = 0; i < codigos.length; i += 100) {
    const { data, error } = await sb.from('actividades').select('id,codigo,tipo,titulo,descripcion,contenido').in('codigo', codigos.slice(i, i + 100));
    if (error) throw error;
    filas.push(...(data as typeof filas));
  }
  const porCodigo = new Map(filas.map((f) => [f.codigo, f]));

  const fallos: string[] = [];
  const cambios = new Map<string, { contenido: Obj; titulo: string; descripcion: string | null; n: number }>();
  const textosCorregidos: { codigo: string; actual: string; propuesta: string }[] = [];
  for (const h of elegidos) {
    const fila = porCodigo.get(h.codigo);
    if (!fila) { fallos.push(`${h._id} ${h.codigo}: actividad no existe`); continue; }
    const c = cambios.get(h.codigo) ?? { contenido: structuredClone(fila.contenido), titulo: fila.titulo, descripcion: fila.descripcion, n: 0 };
    // `titulo`/`descripcion` sin ese campo dentro del contenido son las columnas de la fila.
    const columna = (h.ruta === 'titulo' || h.ruta === 'descripcion') && !(h.ruta in c.contenido);
    const raiz = columna ? (c as unknown as Obj) : c.contenido;
    const err = aplicarUno(raiz, h);
    if (err) { fallos.push(`${h._id} ${h.codigo} ${h.ruta}: ${err}`); continue; }
    c.n++;
    cambios.set(h.codigo, c);
    if (h.actual.length >= 18) textosCorregidos.push({ codigo: h.codigo, actual: h.actual, propuesta: h.propuesta });
  }

  // Debates: el texto de cada postura es la CLAVE de `argumentos_guia`. Los
  // hallazgos se escribieron con las claves viejas, así que se renombran al final.
  for (const [codigo, c] of cambios) {
    const antes = porCodigo.get(codigo)!.contenido as { posturas?: unknown };
    const despues = c.contenido as { posturas?: unknown; argumentos_guia?: Record<string, unknown> };
    if (!Array.isArray(antes.posturas) || !Array.isArray(despues.posturas) || !despues.argumentos_guia) continue;
    antes.posturas.forEach((viejo, i) => {
      const nuevo = (despues.posturas as unknown[])[i];
      if (typeof viejo === 'string' && typeof nuevo === 'string' && viejo !== nuevo && viejo in despues.argumentos_guia!) {
        despues.argumentos_guia![nuevo] = despues.argumentos_guia![viejo];
        delete despues.argumentos_guia![viejo];
      }
    });
  }

  // Debates cuyas claves de `argumentos_guia` NUNCA coincidieron con el texto de
  // la postura («Sí cumple» vs «Sí cumple: tiene instituciones…», o
  // «destruyen_identidad»): la pantalla busca `argumentos_guia[postura]` y no
  // mostraba ningún argumento guía. Se reasignan si el emparejamiento es 1 a 1.
  const { data: debates, error: eDeb } = await sb.from('actividades').select('id,codigo,tipo,titulo,descripcion,contenido').eq('tipo', 'debate_estructurado');
  if (eDeb) throw eDeb;
  const plano = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/_/g, ' ').replace(/^postura [ab] /, '');
  for (const d of debates as typeof filas) {
    if (!porCodigo.has(d.codigo)) porCodigo.set(d.codigo, d);
    const c = cambios.get(d.codigo) ?? { contenido: structuredClone(d.contenido), titulo: d.titulo, descripcion: d.descripcion, n: 0 };
    const cont = c.contenido as { posturas?: string[]; argumentos_guia?: Record<string, unknown> };
    const ps = cont.posturas ?? [];
    const guia = cont.argumentos_guia ?? {};
    const claves = Object.keys(guia);
    if (!ps.length || ps.every((p) => p in guia)) continue;
    const puntaje = (k: string, p: string) => {
      const kp = plano(k), pp = plano(p);
      if (pp.startsWith(kp)) return 1e6 + kp.length;
      // Palabras de la clave presentes en la postura (raíz de 5 letras); a
      // igualdad, gana la que aparece antes: es la que nombra la postura.
      const pos = kp.split(' ').filter((w) => w.length > 3).map((w) => pp.indexOf(w.slice(0, 5))).filter((i) => i >= 0);
      return pos.length ? pos.length * 1000 - Math.min(...pos) : 0;
    };
    const asignacion = ps.map((p) => {
      const orden = claves.map((k) => [k, puntaje(k, p)] as const).sort((x, y) => y[1] - x[1]);
      return orden[0] && orden[0][1] > 0 && (orden.length < 2 || orden[0][1] > orden[1][1]) ? orden[0][0] : null;
    });
    if (asignacion.some((k) => k === null) || new Set(asignacion).size !== ps.length) { fallos.push(`${d.codigo}: claves de debate sin emparejar (${claves.join(', ')})`); continue; }
    const nueva: Record<string, unknown> = {};
    ps.forEach((p, i) => { nueva[p] = guia[asignacion[i]!]; });
    cont.argumentos_guia = nueva;
    c.n++;
    cambios.set(d.codigo, c);
    console.log(`debate ${d.codigo}: ${asignacion.map((k, i) => `«${k}» → «${ps[i]!.slice(0, 45)}…»`).join(' | ')}`);
  }

  // Validación con el esquema de la app.
  const invalidas: string[] = [];
  for (const [codigo, c] of cambios) {
    const tipo = porCodigo.get(codigo)!.tipo;
    if (!(tipo in VALIDADORES_CONTENIDO)) continue;
    const r = validarContenidoActividad(tipo as TipoActividadKey, c.contenido);
    if (!r.success) { invalidas.push(`${codigo}: ${JSON.stringify(r.error?.issues?.[0] ?? r).slice(0, 200)}`); cambios.delete(codigo); }
  }

  // ¿El texto viejo también está copiado en el código de algún lab?
  const fuentes = archivosFuente('src').map((p) => [p, readFileSync(p, 'utf8')] as const);
  // Los labs citan textos de la BD (fichas, quizzes, glosarios). Con
  // --propagar se corrige igual la copia, para que la plataforma no se
  // contradiga. Se salta si la propuesta trae comillas que la original no
  // tenía (podría cerrar el literal de TS) y se lista para hacerlo a mano.
  const PROPAGAR = process.argv.includes('--propagar');
  const original = new Map<string, string>(fuentes);
  const editados = new Map<string, string>(fuentes);
  const copias: string[] = [];
  const aMano: string[] = [];
  for (const t of textosCorregidos) {
    if (!cambios.has(t.codigo)) continue;
    for (const [p] of fuentes) {
      const s = editados.get(p)!;
      if (!s.includes(t.actual)) continue;
      const comillasNuevas = ['"', "'", '`', '\\'].some((q) => t.propuesta.includes(q) && !t.actual.includes(q));
      if (comillasNuevas) { aMano.push(`${p}  ←  ${t.codigo}: «${t.actual.slice(0, 70)}» → «${t.propuesta.slice(0, 70)}»`); continue; }
      copias.push(p);
      editados.set(p, s.split(t.actual).join(t.propuesta));
    }
  }

  console.log(`actividades a escribir ${cambios.size} | cambios ${[...cambios.values()].reduce((a, c) => a + c.n, 0)}`);
  if (fallos.length) console.log(`\nNO APLICADOS (${fallos.length}):\n  ` + fallos.join('\n  '));
  if (invalidas.length) console.log(`\nRECHAZADOS POR ESQUEMA (${invalidas.length}):\n  ` + invalidas.join('\n  '));
  if (copias.length) console.log(`\nCOPIAS EN CÓDIGO ${PROPAGAR ? 'A CORREGIR' : '(usa --propagar)'}: ${copias.length} reemplazos en ${new Set(copias).size} archivos`);
  if (aMano.length) console.log(`\nCOPIAS A CORREGIR A MANO (${aMano.length}):\n  ` + aMano.join('\n  '));

  if (!APLICAR) { console.log('\n(simulación — usa --aplicar para escribir)'); return; }
  if (PROPAGAR) for (const [p, s] of editados) if (s !== original.get(p)) writeFileSync(p, s);
  const respaldo = `scripts/.auditoria/respaldo-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
  writeFileSync(respaldo, JSON.stringify([...cambios.keys()].map((c) => porCodigo.get(c)), null, 1));
  let ok = 0;
  for (const [codigo, c] of cambios) {
    const fila = porCodigo.get(codigo)!;
    const { error } = await sb.from('actividades').update({ contenido: c.contenido, titulo: c.titulo, descripcion: c.descripcion }).eq('id', fila.id);
    if (error) console.log(`ERROR ${codigo}: ${error.message}`); else ok++;
  }
  console.log(`\nEscritas ${ok}/${cambios.size}. Respaldo: ${respaldo}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
