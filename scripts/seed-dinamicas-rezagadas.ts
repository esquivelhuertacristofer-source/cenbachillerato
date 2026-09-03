/**
 * LAS PROGRESIONES QUE SE QUEDARON SIN NADA QUE TOCAR.
 *
 * De las 240 progresiones, 103 no tienen laboratorio. Eso por sí solo no es un
 * defecto: un laboratorio 3D de "figuras retóricas" sería un disfraz. Lo que sí
 * es un defecto es una progresión donde el alumno solo lee, responde y escribe,
 * sin una sola actividad que se manipule. De esas 103, ochenta ya tienen alguna
 * actividad dinámica. Veintitrés no tenían ninguna. Este script cierra ese hueco.
 *
 * POR QUÉ SE HABÍAN QUEDADO FUERA. No por falta de contenido, sino por dos reglas
 * que `seed-actividades-dinamicas.ts` se puso a sí mismo:
 *
 *   · pedía 5 parejas y doce de ellas tienen glosarios de exactamente 4 términos;
 *   · descartaba definiciones de más de 150 caracteres, y once tienen glosarios
 *     bien escritos cuyas definiciones rondan los 200.
 *
 * Las dos reglas eran razonables como piso de calidad para una corrida masiva —
 * es mejor no generar que generar mal— pero aplicadas al residuo dejan fuera
 * contenido que sí sirve. El esquema `relacionar_columnas` admite desde 3 parejas
 * y no limita el largo del texto; y la definición larga es EXACTAMENTE la que el
 * alumno ya lee en el glosario de esa misma progresión, así que no hay nada que
 * recortar. Aquí se bajan los dos umbrales y se documenta por qué.
 *
 * LO QUE NO SE HACE. No se inventa contenido. Si una progresión no tiene glosario
 * con al menos 3 términos utilizables, este script la reporta y la deja para
 * autoría a mano — que es lo que hace `seed-dinamicas-autor.ts`. Rellenar con
 * texto generado sería peor que el hueco: el hueco se ve, el relleno no.
 *
 * Uso: npx tsx scripts/seed-dinamicas-rezagadas.ts [--dry]
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";
import { validarContenidoActividad } from "../src/lib/activities/validators";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

const DRY = process.argv.includes("--dry");

/** Mínimo que admite el esquema. Tres parejas siguen siendo un ejercicio real. */
const PAREJAS_MIN = 3;
const PAREJAS_IDEAL = 5;
/**
 * 260 caracteres. No es un número redondo: es el largo de la definición más
 * extensa que aparece en estos glosarios ("Servicios ecosistémicos", 282, es la
 * única que queda fuera y se descarta sola). Se elige medir el corpus real en
 * vez de fijar un tope de escritorio, porque el tope de escritorio fue justamente
 * lo que dejó estas once progresiones sin actividad.
 */
const MAX_DEFINICION = 260;
const DISTRACTORES_MAX = 2;

interface Termino { termino?: string; definicion?: string }

/** Baraja determinista: la misma progresión da siempre el mismo orden. */
function barajar<T>(xs: T[], semilla: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < semilla.length; i++) {
    h ^= semilla.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    const j = Math.abs(h) % (i + 1);
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

type SB = ReturnType<typeof createClient<Database>>;

/** Lee una tabla completa: PostgREST corta en 1000 filas y hay 2166 actividades. */
async function todas<T>(sb: SB, tabla: string, cols: string): Promise<T[]> {
  const out: T[] = [];
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await sb.from(tabla as "actividades").select(cols).range(desde, desde + 999);
    if (error) throw new Error(`${tabla}: ${error.message}`);
    if (!data?.length) break;
    out.push(...(data as unknown as T[]));
    if (data.length < 1000) break;
  }
  return out;
}

const DINAMICOS = new Set([
  "ordenar_secuencia", "relacionar_columnas", "clasificar_categorias",
  "caso_decision", "reto_cronometrado", "simulacion",
]);

async function main() {
  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const progs = await todas<{ id: string; codigo: string; titulo: string }>(sb, "progresiones", "id,codigo,titulo");
  const acts = await todas<{
    codigo: string; tipo: string; progresion_id: string | null;
    practica_slug: string | null; contenido: Record<string, unknown> | null;
  }>(sb, "actividades", "codigo,tipo,progresion_id,practica_slug,contenido");

  // Estado por progresión: ¿tiene laboratorio?, ¿tiene algo manipulable?
  const estado = new Map<string, { lab: boolean; dinamica: boolean; maxOrden: number }>();
  for (const p of progs) estado.set(p.id, { lab: false, dinamica: false, maxOrden: 0 });
  for (const a of acts) {
    if (!a.progresion_id) continue;
    const e = estado.get(a.progresion_id);
    if (!e) continue;
    if (a.practica_slug) e.lab = true;
    if (DINAMICOS.has(a.tipo)) e.dinamica = true;
    const m = /-A(\d+)$/.exec(a.codigo);
    if (m) e.maxOrden = Math.max(e.maxOrden, Number(m[1]));
  }

  const objetivo = progs.filter((p) => {
    const e = estado.get(p.id)!;
    return !e.lab && !e.dinamica;
  });

  console.log(`\nProgresiones sin laboratorio NI actividad dinámica: ${objetivo.length}\n`);

  const aInsertar: Array<Record<string, unknown>> = [];
  const sinMateria: string[] = [];

  for (const p of objetivo) {
    const glosario = acts.find((a) => a.progresion_id === p.id && a.tipo === "glosario_interactivo");
    const terminos = ((glosario?.contenido?.terminos ?? []) as Termino[]).filter(
      (t) => t.termino && t.definicion && t.definicion.length <= MAX_DEFINICION
    );

    if (terminos.length < PAREJAS_MIN) {
      sinMateria.push(`${p.codigo} (${terminos.length} términos utilizables)`);
      continue;
    }

    const elegidos = barajar(terminos, p.codigo);
    const nParejas = Math.min(PAREJAS_IDEAL, elegidos.length);
    const parejas = elegidos.slice(0, nParejas).map((t) => ({
      izquierda: t.termino!,
      derecha: t.definicion!,
    }));
    // Los distractores salen del mismo glosario: una definición de otro término
    // de la materia es plausible; una inventada se detecta a simple vista.
    const distractores = elegidos
      .slice(nParejas, nParejas + DISTRACTORES_MAX)
      .map((t) => t.definicion!);

    const e = estado.get(p.id)!;
    const codigo = `${p.codigo}-A${e.maxOrden + 1}`;

    const contenido = {
      instrucciones:
        "Toca un concepto de la izquierda y después la definición que le corresponde. " +
        "Puedes cambiar una pareja tocándola de nuevo antes de revisar.",
      titulo_izquierda: "Concepto",
      titulo_derecha: "Definición",
      parejas,
      distractores,
      puntaje_minimo_aprobacion: 70,
    };

    const v = validarContenidoActividad("relacionar_columnas", contenido);
    if (!v.success) {
      sinMateria.push(`${p.codigo} (contenido inválido)`);
      continue;
    }

    aInsertar.push({
      codigo,
      titulo: "Relaciona los conceptos clave de esta progresión",
      descripcion: `Empareja cada concepto de ${p.codigo} con la definición que le corresponde.`,
      tipo: "relacionar_columnas",
      tipo_codigo: "relacionar_columnas",
      contenido: v.data,
      progresion_id: p.id,
      xp: 10,
      estado: "publicada",
    });
    console.log(`  + ${codigo}  (${parejas.length} parejas, ${distractores.length} distractores)`);
  }

  if (sinMateria.length) {
    console.log(`\nSin materia suficiente — requieren autoría a mano (${sinMateria.length}):`);
    for (const s of sinMateria) console.log(`  · ${s}`);
  }

  if (DRY) {
    console.log(`\n[--dry] Se insertarían ${aInsertar.length}. Nada escrito.`);
    return;
  }

  let ok = 0;
  for (let i = 0; i < aInsertar.length; i += 50) {
    const lote = aInsertar.slice(i, i + 50);
    const { error } = await sb.from("actividades").upsert(lote as never, { onConflict: "codigo" });
    if (error) { console.log(`  ✗ lote ${i}: ${error.message}`); continue; }
    ok += lote.length;
  }
  console.log(`\nInsertadas ${ok}/${aInsertar.length}`);
}

main();
